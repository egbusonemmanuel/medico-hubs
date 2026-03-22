# System Architecture

Medico Hub is built upon a highly scalable, serverless architecture centered around Supabase.

## High-Level Data Flow

```mermaid
graph TD
    %% Clients
    MobileApp[📲 Mobile App: React Native]
    WebApp[💻 Web App: React.js]
    
    %% API / Edge layer
    API_Gateway[Supabase Edge Functions]
    
    %% Database & Auth
    SupabaseAuth[Supabase Auth]
    SupabaseDB[(PostgreSQL DB)]
    SupabaseStore[Supabase Storage Buckets]
    SupabaseRealtime[Supabase Realtime]
    
    %% External Services
    LLM[🤖 OpenAI / Anthropic APIs]
    Payment[💳 Paystack / Stripe]
    
    %% Connections
    MobileApp --> |JWT Auth| SupabaseAuth
    WebApp --> |JWT Auth| SupabaseAuth
    
    MobileApp <--> |GraphQL / REST| SupabaseDB
    WebApp <--> |GraphQL / REST| SupabaseDB
    
    MobileApp <--> |WebSockets| SupabaseRealtime
    WebApp <--> |WebSockets| SupabaseRealtime
    
    MobileApp --> |PDF/Audio Upload| SupabaseStore
    WebApp --> |PDF/Audio Upload| SupabaseStore
    
    %% Edge Functions routing
    MobileApp --> |Trigger AI & Webhooks| API_Gateway
    WebApp --> |Trigger AI & Webhooks| API_Gateway
    
    API_Gateway --> |Generate Summaries| LLM
    API_Gateway --> |Extract Text from Storage| SupabaseStore
    API_Gateway --> |Process Subscriptions| Payment
    
    LLM --> |Return structured JSON| API_Gateway
    API_Gateway --> |Insert Verified=False| SupabaseDB
```

## AI Pipeline Detail

```mermaid
sequenceDiagram
    participant Student
    participant Storage as Supabase Storage
    participant Edge as Edge Function (Webhook)
    participant LLM as GPT-4 / Claude
    participant DB as Supabase DB
    participant Tutor

    Student->>Storage: Uploads "Cardio_Notes.pdf"
    Storage-->>Edge: onUpload Trigger
    Edge->>Edge: Extract Text from PDF
    Edge->>LLM: Prompt + Raw Text
    LLM-->>Edge: JSON (Summary, Flashcards, Mermaid)
    Edge->>DB: Insert into Summaries (verified = false)
    DB-->>Student: Realtime update - "AI Summary Ready"
    
    Note over DB,Tutor: Verification Layer
    Tutor->>DB: Queries unverified summaries (RLS)
    Tutor->>Edge: POST /verify-summary
    Edge->>DB: UPDATE Summaries SET verified = true
    DB-->>Student: Realtime update - "Summary Verified! +50 XP"
```

## Security & Concurrency
- **Concurrency**: High write-throughput (e.g. flashcard swipes) relies directly on Supabase PostgreSQL.
- **Security**: Strict Row-Level Security (RLS) prevents unauthorized reading of private notes. The `is_tutor_or_admin` function safeguards AI verification pipelines.
