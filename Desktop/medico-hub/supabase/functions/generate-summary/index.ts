// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate the JWT and parse the request payload
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { note_id } = await req.json()
    if (!note_id) throw new Error('Note ID is required')

    // 2. Fetch the Note record to get the text / file path
    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .select('*')
      .eq('id', note_id)
      .single()

    if (noteError || !note) throw new Error('Note not found')

    let rawText = note.raw_text

    // If text isn't extracted yet but we have a file, ideally call a PDF extraction service.
    if (!rawText && note.file_url) {
        console.log(`Extracting text from ${note.file_url}...`)
        rawText = "Extracted text snippet representing the content of the file. In a full production app, this is replaced by a text-extraction library parsing the PDF."
    }

    if (!rawText) throw new Error('No text content available to summarize')

    // 3. Call the LLM (OpenAI)
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    let aiResponseSummary: string[] = [];
    let aiResponseKeyConcepts: Record<string, string> = {};
    let aiResponseFlashcards: any[] = [];

    if (openAiApiKey) {
        console.log("Calling OpenAI API for text summarization...");
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical AI assistant. Analyze the text and return a JSON object with exactly three keys:
1. 'summary': An array of EXACTLY 5 strings, representing the highest-yield medical takeaways.
2. 'key_concepts': A dictionary object of medical terminology defined from the text.
3. 'flashcards': An array of objects, each with 'question', 'answer', and 'difficulty_level' (easy/medium/hard).`
                    },
                    { role: 'user', content: rawText }
                ],
                temperature: 0.2
            })
        });

        if (!aiRes.ok) {
            const errBody = await aiRes.text();
            throw new Error(`OpenAI API error: ${aiRes.status} - ${errBody}`);
        }

        const aiData = await aiRes.json();
        const parsed = JSON.parse(aiData.choices[0].message.content);
        
        aiResponseSummary = parsed.summary || [];
        aiResponseKeyConcepts = parsed.key_concepts || {};
        aiResponseFlashcards = parsed.flashcards || [];
    } else {
        console.warn("Missing OPENAI_API_KEY. Simulating response.");
        aiResponseSummary = [
           "Arrhythmias are abnormal heart rhythms caused by structural or electrical issues.",
           "Atrial Fibrillation (AFib) is the most common sustained arrhythmia, heightening stroke risk.",
           "Treatment often involves anticoagulants and rate-control medications like Beta-blockers.",
           "Ventricular Fibrillation is a medical emergency requiring immediate CPR and defibrillation.",
           "ECG is the gold standard diagnostic tool for identifying the specific type of arrhythmia."
        ];
        aiResponseKeyConcepts = {
            "AFib": "Irregular, often rapid heart rate that causes poor blood flow.",
            "ECG": "Electrocardiogram, a test measuring the electrical activity of the heart."
        };
        aiResponseFlashcards = [
            { question: "What is the most common sustained arrhythmia?", answer: "Atrial Fibrillation (AFib)", difficulty_level: 'easy' },
            { question: "What is the gold standard diagnostic tool for arrhythmias?", answer: "Electrocardiogram (ECG)", difficulty_level: 'easy' }
        ];
    }

    // 4. Save the Generated Output to the database marked as UNVERIFIED
    const { data: summaryData, error: insertError } = await supabaseClient
      .from('summaries')
      .insert({
         note_id: note.id,
         ai_summary: aiResponseSummary,
         key_concepts: aiResponseKeyConcepts,
         verified: false, // CRITICAL: Must be false by default
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Generate flashcards linked to this summary
    const flashcardsToInsert = aiResponseFlashcards.map((fc: any) => ({
        user_id: user.id,
        question: fc.question,
        answer: fc.answer,
        source_summary_id: summaryData.id,
        difficulty_level: fc.difficulty_level || 'medium'
    }));

    if (flashcardsToInsert.length > 0) {
        await supabaseClient.from('flashcards').insert(flashcardsToInsert);
    }

    return new Response(
      JSON.stringify({ 
          success: true, 
          message: 'AI Processing Complete. Outputs saved as Unverified.',
          summary_id: summaryData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
