# AI Workflow & Pipeline Architecture

The AI Workflow for Medico Hub ensures that medical text is accurately extracted, concisely synthesized, and rigorously validated before it is circulated in the application.

## Pipeline Overview

### **Step 1: Document Ingestion**
- A user uploads a document (PDF, DOCX) or an audio recording (lecture) from the Mobile or Web application.
- The file is uploaded securely to a **Supabase Storage Bucket** (`notes_bucket`).
- A record is created in the `Notes` table with the `file_url` linking to the storage.

### **Step 2: Text Extraction & Normalization (Edge Function)**
- Upon document upload, a webhook triggers a Supabase Edge Function.
- **For PDFs:** The Edge Function uses a library (e.g., pdf-parse or via API like Unstructured.io) to extract raw text.
- **For Audio:** The audio file is pushed to OpenAI's Whisper API to generate a raw text transcript.
- The text representation is saved in `Notes.raw_text`.

### **Step 3: AI Synthesis Generation**
An Edge Function invokes **OpenAI (GPT-4) or Anthropic (Claude 3)**. The System Prompt rigorously enforces medical structuring.

The model is instructed to output via structured JSON:
1. **5-point High-Yield Summary**: Condensing the document into exactly 5 fundamental medical takeaways.
2. **Key Concepts List**: Definitions of crucial terminologies found in the text.
3. **Flashcards**: Pairs of Q&A with labeled difficulties (Easy/Medium/Hard).
4. **Mind Map Generation**: Synthesizing the relational structure of the text into Mermaid.js format.

### **Step 4: Database Storage & Flagging**
- The parsed structures from the AI are stored in their respective tables (`Summaries`, `Flashcards`, `MindMaps`).
- **CRITICAL SAFEGUARD**: All newly inserted summaries default to `verified: false`.
- The user interface explicitly decorates these entities with a visual "Unverified AI Output" badge, along with the disclaimer: *"Educational use only. Not for clinical decision making."*

### **Step 5: The Verification Mechanism**
- Tutors or designated high-ranking users review the Unverified feeds.
- A Tutor utilizes the UI to approve the AI outputs by sending a `POST /verify-summary` request.
- If inconsistencies exist, the Tutor modifies the outputs prior to verifying.
- Once updated:
  - `verified` flips to `true`.
  - The content is designated as "High-Yield".
  - The algorithm grants an SEO/Ranking boost in the discovery feeds.
  - Generates +50 XP for the user who uploaded the contribution (Gamification).
