import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate the user making the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { note_id } = await req.json()
    if (!note_id) throw new Error('Note ID is required')

    // 2. Fetch the note content
    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .select('*')
      .eq('id', note_id)
      .single()

    if (noteError || !note) throw new Error('Note not found')

    const rawText = note.raw_text
    if (!rawText) throw new Error('This note has no text content to summarize. Please ensure the note has raw text.')

    // 3. Call Google Gemini API (FREE tier — gemini-1.5-flash)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is not configured in Supabase secrets.')

    const prompt = `You are an expert medical AI tutor. Analyze the following medical notes and respond with ONLY a valid JSON object (no markdown, no code blocks).

The JSON must have exactly these three keys:
- "summary": array of exactly 5 strings — the highest-yield clinical takeaways
- "key_concepts": object where keys are medical terms and values are their definitions
- "flashcards": array of objects, each with "question" (string), "answer" (string), "difficulty_level" ("easy" | "medium" | "hard")

Medical notes to analyze:
"""
${rawText.substring(0, 12000)}
"""`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        })
      }
    )

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      throw new Error(`Gemini API error: ${geminiRes.status} — ${errBody}`)
    }

    const geminiData = await geminiRes.json()
    const rawContent: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    
    // Strip markdown code fences if Gemini wraps the output (safety measure)
    const cleanContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleanContent)
    } catch {
      throw new Error(`Gemini returned invalid JSON. Raw: ${cleanContent.substring(0, 200)}`)
    }

    const aiSummary: string[] = Array.isArray(parsed.summary) ? parsed.summary : []
    const keyConcepts: Record<string, string> = typeof parsed.key_concepts === 'object' ? parsed.key_concepts : {}
    const flashcards: any[] = Array.isArray(parsed.flashcards) ? parsed.flashcards : []

    // 4. Save the summary (marked as UNVERIFIED — admin must verify before public badge)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: summaryData, error: insertError } = await supabaseAdmin
      .from('summaries')
      .insert({
        note_id: note.id,
        ai_summary: aiSummary,
        key_concepts: keyConcepts,
        verified: false,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Save generated flashcards linked to this summary
    if (flashcards.length > 0) {
      const flashcardsToInsert = flashcards.map((fc: any) => ({
        user_id: user.id,
        question: fc.question,
        answer: fc.answer,
        source_summary_id: summaryData.id,
        difficulty_level: ['easy', 'medium', 'hard'].includes(fc.difficulty_level) ? fc.difficulty_level : 'medium',
      }))
      await supabaseAdmin.from('flashcards').insert(flashcardsToInsert)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Summary complete! Generated ${aiSummary.length} key points and ${flashcards.length} flashcards.`,
        summary_id: summaryData.id,
        summary: aiSummary,
        key_concepts: keyConcepts,
        flashcards_generated: flashcards.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('generate-summary error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
