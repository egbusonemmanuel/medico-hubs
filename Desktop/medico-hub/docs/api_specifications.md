# Medico Hub - API Specifications

This document outlines the core Edge Functions / REST calls for Medico Hub. The API utilizes Supabase Edge Functions primarily for operations requiring external API interactions securely (e.g., OpenAI integrations, Payment Gateways) and complex procedural logic.

## Base URL
All Endpoints are assumed to be hosted on `https://<YOUR_SUPABASE_PROJECT>.supabase.co/functions/v1/`

All endpoints require the Authorization header:
`Authorization: Bearer <user_jwt_token>`

---

### `POST /upload-note`

**Description:** Handles the initial file upload (PDF/Audio) to Supabase Storage and creates a record in the `Notes` table.

**Request Body:**
```json
{
  "title": "Cardiology Basics",
  "file_path": "uploads/user_id/cardio.pdf" // Path generated after direct storage upload, or base64 if sending directly
}
```

**Response:**
```json
{
  "success": true,
  "note_id": "uuid-here",
  "message": "Note uploaded successfully. Ready for processing."
}
```

---

### `POST /generate-summary`

**Description:** Triggers the AI pipeline to read the text of a note and generate a structured summary including key concepts and initial mind maps.

**Request Body:**
```json
{
  "note_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "summary_id": "uuid-here",
  "status": "processing" // Can be polled or listen via Supabase Realtime
}
```

---

### `POST /generate-flashcards`

**Description:** Triggers AI to create a spaced-repetition deck based on a generated summary.

**Request Body:**
```json
{
  "summary_id": "uuid-here",
  "count": 10,
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "flashcard_ids": ["uuid-1", "uuid-2"],
  "message": "10 Flashcards generated successfully."
}
```

---

### `POST /verify-summary`

**Description:** Allows a tutor or a high-ranking admin to verify AI-generated content.

**Request Body:**
```json
{
  "summary_id": "uuid-here",
  "action": "verify", // or "flag"
  "edits": {
     // Optional edits made by the tutor to fix minor logic
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Summary verified and ranked boosted."
}
```

---

### `GET /leaderboard`

**Description:** Retrieves the Top Surgeon (individual) or Elite Hospital (group) leaderboard based on XP & Clinic Clash outcomes.

**Query Parameters:**
- `type`: `individual` | `group`
- `limit`: `integer`

**Response:**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "name": "John Doe", "xp": 1500 },
    { "rank": 2, "name": "Jane Smith", "xp": 1450 }
  ]
}
```

---

### `POST /join-group`

**Description:** Join an existing Med-Squad organization.

**Request Body:**
```json
{
  "group_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined group successfully."
}
```

---

### `POST /start-competition`

**Description:** Admins/System can start a Clinic Clash weekly competition.

**Request Body:**
```json
{
  "week_start": "2023-11-01",
  "week_end": "2023-11-07"
}
```

**Response:**
```json
{
  "success": true,
  "competition_id": "uuid-here"
}
```

---

### `POST /subscribe`

**Description:** Initializes the Paystack/Stripe checkout session for premium features.

**Request Body:**
```json
{
  "plan": "premium" // or institutional
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/..."
}
```
