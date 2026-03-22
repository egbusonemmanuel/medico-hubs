# Frontend Architectures

Medico Hub employs a unified approach across its Web (React.js) and Mobile (React Native) applications to maximize code sharing, specifically around state management and API interactions.

## 1. Core State & Data Management (Shared)

- **Supabase Client**: Standardize the Supabase SDK for authentication, storage, and database access.
- **TanStack Query (React Query)**: Used for robust server-state management. It handles caching, background updates, and stale data, highly suited for real-time dashboards and feeds.
- **Zustand**: For lightweight client-side global state (e.g., Theme, Onboarding Status, User Identity snapshot).
- **Zod**: For schema validation on both input forms and API responses.

## 2. Shared Gamification Engine

Both platforms inject standardized UI events when XP is granted:
- React Native Reanimated (Mobile) / Framer Motion (Web) handles micro-interactions.
- e.g., Confetti drops on verification, XP progress bars filling up dynamically.

---

## 3. Mobile Architecture (React Native / Expo)

Designed primarily for the medical student commuting or studying on rounds.

**Routing: React Navigation**
- **AuthStack**: Login, Register, Forgot Password
- **MainTabs**:
  - **Home**: Feed of High-Yield Summaries, Daily Streak widget
  - **Study**: Flashcard Decks (Spaced Repetition swiper UI)
  - **Upload**: Camera / File picker for notes
  - **Squads**: Group chats and Clinic Clash status
  - **Profile**: Leaderboard, XP, Settings

**Key Components**
- `<SwipeableFlashcard />`: Tinder-like card swiper for reviewing.
- `<MermaidRenderer />`: Integration of mermaid.js via a Webview to render interactive mind maps.
- `<AudioRecorder />`: For capturing live lectures directly into storage.

---

## 4. Web Architecture (React.js / Next.js OR Vite)

Designed primarily for Tutors reviewing content, and students engaging in deep-work sessions where a large screen is required.

**Routing: React Router (if SPA) or Next.js App Router**
- `/login`, `/register`
- `/dashboard`: Overall analytics, top pinned notes.
- `/tutor-portal`: Exclusively designed for the Tutor role.
  - `/tutor-portal/verify`: Feed of unverified summaries. Split-screen view showing original text vs AI summary.
  - `/tutor-portal/sessions`: Managing live sessions and pushing real-time Q&A.
- `/squads`: Med-Squad management.
- `/leaderboard`: Global / Group rankings.

**Key Components**
- `<SplitWorkspace />`: For viewing PDF/Source next to the Notes/MindMap editor.
- `<MindMapCanvas />`: A large interactive canvas for exploring generated mermaid structures.
- `<VerificationQueue />`: For tutors to quickly accept/edit/flag summaries in bulk.

## 5. UI/UX Design System

- **Aesthetic**: Clean, modern "Medical Professional" (Whites, Soft Teals, Deep Blues).
- Use of Glassmorphism for floating widgets.
- Rounded, friendly typography (e.g., Inter, Plus Jakarta Sans) to offset the stressful nature of medical studies.
