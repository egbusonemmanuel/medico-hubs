# Deployment Strategy, MVP Roadmap, and Safety Guardrails

## 1. Safety & Accuracy Guardrails

Because Medico Hub operates in the medical domain, safety and accuracy are paramount. LLM hallucinations can be highly dangerous.

- **Mandatory Disclaimers**: Every AI-generated UI component explicitly states: *"Educational use only. Not for clinical decision making. Please refer to primary literature."*
- **Unverified AI Tagging**: All AI outputs (`summaries`, `flashcards`, `mindmaps`) are tagged with `verified: false` by default. They visually appear distinctly (e.g., striped background or warning icon) until a Tutor reviews them.
- **Tutor "High-Yield" Verification**: Tutors have exclusive rights (via RLS) to toggle `verified: true`, moving content into the trusted ecosystem algorithm.
- **Flagging System**: Any student can flag potentially incorrect information. Accumulating flags will temporarily hide the resource until reviewed by an admin.
- **Version History**: Modifications by tutors are tracked, preserving the original AI context versus human edits.

---

## 2. 3-Month MVP Roadmap

### **Month 1: Foundation & The "Magic" Upload**
**Goal:** Prove the core value proposition of AI generating study materials.
- Setup Supabase (PostgreSQL, Auth, Storage).
- Build the Edge Function for PDF text extraction.
- Integrate the OpenAI prompt pipeline to generate the 5-point summary and JSON flashcards.
- Release basic Mobile & Web apps with Manual Auth, Note Uploads, and basic viewing.

### **Month 2: Gamification & Visualization**
**Goal:** Enhance retention with SRS and competitive elements.
- Integrate `mermaid.js` renderer into mobile and web for dynamic mind maps.
- Implement the Spaced Repetition System (SRS) algorithm internally for the flashcard swiper.
- Launch Med-Squads (Groups) DB architecture, allowing users to form teams.
- Build the initial Global Leaderboard.

### **Month 3: The Tutor Economy & Monetization**
**Goal:** Introduce the human-in-the-loop verification and finalize MVP features.
- Build the Web "Tutor Dashboard" for efficiently verifying AI outputs.
- Launch "Clinic Clash" logic (weekly competitive engine assigning XP to groups).
- Integrate Paystack/Stripe via Edge Functions for Premium & Institutional tiers.
- Final Polish & Testing.
