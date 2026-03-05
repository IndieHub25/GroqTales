<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# AI Prompt Engineering — Story Generation System

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

GroqTales uses a sophisticated prompt engineering system to generate high-quality, structured stories
and optional comic panel breakdowns. The AI backend accepts **70+ configurable parameters** across
9 categories and produces a single, valid JSON response ready for rendering, publishing, or minting
as an NFT.

This page documents the **full parameter specification**, **output JSON schema**, **content safety
rules**, and **behavioral guidelines** that drive the story generation engine.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Parameter Reference](#parameter-reference)
  - [Core Parameters](#core-parameters)
  - [Characters](#characters)
  - [Plot & Structure](#plot--structure)
  - [Setting & World](#setting--world)
  - [Writing Style & Tone](#writing-style--tone)
  - [Themes & Messages](#themes--messages)
  - [Content Controls & Safety](#content-controls--safety)
  - [Advanced Options](#advanced-options)
  - [Inspiration & References](#inspiration--references)
  - [Comic / Panel Specific](#comic--panel-specific)
  - [Technical Parameters](#technical-parameters)
- [Output JSON Schema](#output-json-schema)
- [Content Safety Rules](#content-safety-rules)
- [Behavioral Guidelines](#behavioral-guidelines)
- [Example Request & Response](#example-request--response)
- [Next Steps](#next-steps)

---

## 🏗️ Architecture Overview

The story generation pipeline follows this flow:

1. **Frontend** collects user inputs across 9 accordion sections (70+ params).
2. **Backend API** (`POST /api/groq` or `POST /api/v1/ai/generate`) validates inputs and constructs a structured prompt using `groqService`.
3. **Groq AI** processes the prompt using specific models (e.g., `llama-3.3-70b-versatile` for stories, `llama-3.1-8b-instant` for fast tasks).
4. **Parser** validates the JSON schema, extracts chapters, characters, and comic panels.
5. **Frontend** renders the story for preview, editing, publishing, or NFT minting.

### Priority Chain

When constraints conflict, the system enforces this priority order:

```
CONTENT SAFETY > COHERENCE > USER PREFERENCES
```

---

## 📖 Parameter Reference

### Core Parameters

| Parameter           | Type   | Required | Example                                | Description                                           |
| :------------------ | :----- | :------: | :------------------------------------- | :---------------------------------------------------- |
| `title`             | string |    No    | `"The Last Signal"`                    | Story title. AI generates one if omitted.             |
| `genre`             | string |   Yes    | `"Science Fiction"`                    | Primary genre.                                        |
| `subgenre`          | string |    No    | `"Cyberpunk"`                          | Subgenre for more specificity.                        |
| `target_format`     | enum   |   Yes    | `"story"`, `"comic"`, `"novel"`        | Output format context. Controls token budgets.        |
| `word_count_target` | number |    No    | `2500`                                 | Target word count. Length translates to token limits. |

### Characters

| Parameter                 | Type     | Required | Example                                                                                     | Description                                       |
| :------------------------ | :------- | :------: | :------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| `main_characters`         | array    |    No    | `[{"name":"Aria","age":24,"role":"Protagonist","traits":["curious"],"background":"hacker"}]` | Structured character definitions.                 |
| `character_count`         | number   |    No    | `4`                                                                                         | Approximate number of named characters.           |
| `protagonist_archetype`   | string   |    No    | `"reluctant hero"`, `"antihero"`, `"chosen one"`                                            | Protagonist type.                                 |
| `relationship_dynamics`   | string   |    No    | `"slow-burn friendship to romance"`                                                         | How characters relate and evolve.                 |

### Plot & Structure

| Parameter               | Type     | Required | Example                                      | Description                                      |
| :---------------------- | :------- | :------: | :------------------------------------------- | :----------------------------------------------- |
| `plot_structure`         | string   |    No    | `"three-act structure"`, `"hero's journey"`  | Narrative structure pattern.                     |
| `central_conflict`      | string   |    No    | `"rebellion against oppressive regime"`      | Core dramatic tension.                           |
| `pacing`                | string   |    No    | `"fast-paced and punchy"`                    | Story tempo.                                     |
| `ending_type`           | string   |    No    | `"bittersweet"`, `"ambiguous"`, `"tragic"`   | How the story resolves.                          |
| `plot_twists`           | array    |    No    | `["The mentor is the true villain"]`         | Required plot twists.                            |
| `number_of_chapters`    | number   |    No    | `3`                                          | Chapter count (1 = continuous).                  |
| `foreshadowing_level`   | string   |    No    | `"subtle"`, `"moderate"`, `"heavy"`          | Foreshadowing intensity.                         |
| `symbolism_level`       | string   |    No    | `"minimal"`, `"rich with recurring symbols"` | Symbolic depth.                                  |

### Setting & World

| Parameter               | Type   | Required | Example                                       | Description                                     |
| :---------------------- | :----- | :------: | :-------------------------------------------- | :---------------------------------------------- |
| `time_period`           | string |    No    | `"near-future 2084"`                          | When the story takes place.                     |
| `location`              | string |    No    | `"floating megacity above a toxic ocean"`     | Primary setting.                                |
| `world_building_depth`  | string |    No    | `"deep, lore-rich world"`                     | Level of world detail.                          |
| `atmosphere`            | string |    No    | `"noir"`, `"whimsical"`, `"bleak"`            | Emotional atmosphere.                           |

### Writing Style & Tone

| Parameter               | Type   | Required | Example                                      | Description                                      |
| :---------------------- | :----- | :------: | :------------------------------------------- | :----------------------------------------------- |
| `narrative_voice`       | string |    No    | `"close third person"`, `"first person"`     | POV / narrative voice.                           |
| `tone`                  | string |    No    | `"darkly humorous"`, `"tense and suspenseful"` | Overall tone.                                  |
| `style`                 | string |    No    | `"cinematic and visual"`, `"poetic"`         | Writing style.                                   |
| `reading_level`         | string |    No    | `"YA-friendly"`, `"literary and complex"`    | Target reading audience.                         |
| `dialogue_percentage`   | string |    No    | `"50%"`                                      | Proportion of dialogue vs. narration.            |
| `description_detail`    | string |    No    | `"rich, sensory-heavy"`                      | Environmental description level.                 |

### Themes & Messages

| Parameter                     | Type     | Required | Example                                      | Description                                |
| :---------------------------- | :------- | :------: | :------------------------------------------- | :----------------------------------------- |
| `primary_themes`              | array    |    No    | `["identity", "freedom", "found family"]`    | Core thematic elements.                    |
| `secondary_themes`            | array    |    No    | `["loss", "sacrifice"]`                      | Supporting themes.                         |
| `moral_complexity`            | string   |    No    | `"morally gray characters"`                  | Ethical complexity level.                  |
| `social_commentary_level`     | string   |    No    | `"light subtext"`, `"explicit commentary"`   | Social commentary depth.                   |

### Content Controls & Safety

| Parameter                | Type     | Required | Example                                              | Description                                               |
| :----------------------- | :------- | :------: | :--------------------------------------------------- | :-------------------------------------------------------- |
| `violence_level`         | string   |    No    | `"none"`, `"mild"`, `"moderate"`, `"graphic"`        | Violence content level.                                   |
| `romance_level`          | string   |    No    | `"subtle undertones"`, `"mature but fade-to-black"`  | Romance content level.                                    |
| `language_level`         | string   |    No    | `"clean"`, `"mild profanity"`                        | Language content level.                                   |
| `mature_content_flags`   | array    |    No    | `["no explicit sexual content"]`                     | Specific content restrictions.                            |
| `forbidden_content`      | string   |   Yes    | `"no sexual content involving minors"`               | **Hard block** — AI must obey this unconditionally.       |

### Advanced Options

| Parameter                | Type     | Required | Example                                           | Description                                      |
| :----------------------- | :------- | :------: | :------------------------------------------------ | :----------------------------------------------- |
| `multiple_pov`           | string   |    No    | `"2 POVs alternating per chapter"`                | Multi-perspective configuration.                 |
| `narrative_experiments`  | string   |    No    | `"occasional in-world documents"`, `"chat logs"`  | Experimental narrative forms.                    |
| `recurring_motifs`       | string   |    No    | `"mirrors and reflections"`                       | Symbolic motifs to weave in.                     |

### Inspiration & References

| Parameter               | Type     | Required | Example                                           | Description                                      |
| :---------------------- | :------- | :------: | :------------------------------------------------ | :----------------------------------------------- |
| `similar_works`         | string   |    No    | `"Blade Runner meets The Handmaid's Tale"`        | Capture the *feel*, never copy.                  |
| `tropes_to_include`     | array    |    No    | `["Found Family", "Redemption Arc"]`              | Tropes the AI should use.                        |
| `tropes_to_avoid`       | array    |    No    | `["Deus Ex Machina", "Love Triangle"]`            | Tropes the AI must avoid.                        |

### Comic / Panel Specific

These parameters are used only when `target_format` includes `"comic"`:

| Parameter                    | Type   | Required | Example                                      | Description                             |
| :--------------------------- | :----- | :------: | :------------------------------------------- | :-------------------------------------- |
| `comic_panel_count_target`   | number |    No    | `12`                                         | Target number of panels.                |
| `panel_style_guidance`       | string |    No    | `"manga-like, dynamic angles"`               | Visual style direction for artist.      |
| `panel_focus_preferences`    | string |    No    | `"focus on key emotional beats"`             | What panels should prioritize.          |

### Technical Parameters

| Parameter              | Type   | Required | Example                  | Description                                            |
| :--------------------- | :----- | :------: | :----------------------- | :----------------------------------------------------- |
| `model`                | string |    No    | `"llama-3.3-70b-versatile"` | Overrides the default model. Default is Llama 3.3.     |
| `creativity_level`     | string |    No    | `"low"`, `"medium"`, `"high"` | Maps to model temperature (0.3 to 1.1).                |
| `coherence_priority`   | string |    No    | `"very high"`, `"medium"`| When in doubt, coherence over wildness.                |
| `hard_constraints`     | array  |    No    | `["protagonist must survive"]` | Non-negotiable story rules.                      |

---

## 📤 Output JSON Schema

The AI responds with a **single valid JSON object**. No markdown, no commentary — pure JSON.

```json
{
  "title": "string",
  "genre": "string",
  "wordCountApprox": "number",
  "summary": "string (2-3 sentence synopsis)",
  "chapters": [
    {
      "chapterNumber": "number",
      "chapterTitle": "string",
      "chapterSummary": "string",
      "text": "string (full prose for this chapter)"
    }
  ],
  "characters": [
    {
      "name": "string",
      "role": "string (Protagonist/Antagonist/Mentor/etc.)",
      "shortDescription": "string",
      "arcSummary": "string (how they change)"
    }
  ],
  "themes": {
    "primary": ["string"],
    "secondary": ["string"]
  },
  "contentWarnings": ["string"],
  "styleNotes": {
    "tone": "string",
    "voice": "string",
    "pacing": "string"
  },
  "comicScript": {
    "enabled": "boolean",
    "panels": [
      {
        "panelNumber": "number",
        "pageNumber": "number",
        "location": "string",
        "time": "string",
        "visualDescription": "string (what the artist draws)",
        "charactersPresent": ["string"],
        "dialogue": [
          { "speaker": "string", "text": "string" }
        ],
        "caption": "string (optional narration)",
        "emotionalBeat": "string (what the reader feels)"
      }
    ]
  },
  "nftMetadata": {
    "shortBlurb": "string (1-3 sentence marketplace pitch, no spoilers)",
    "tags": ["string"],
    "recommendedMintEditionSize": "number"
  }
}
```

### Schema Notes

- `comicScript.enabled` is `true` only when `target_format` includes `"comic"`.
- `chapters` will have 1 entry if `number_of_chapters` is 1 (continuous story with logical sections).
- `nftMetadata.shortBlurb` **never spoils** the ending — it teases, not summarizes.
- `contentWarnings` are auto-generated based on the story content, not the input parameters.

---

## 🛡️ Content Safety Rules

The AI enforces a strict content safety hierarchy:

1. **`forbidden_content`** — Hard blocks. The AI will refuse to generate any content matching these
   constraints, even if it reduces dramatic potential.
2. **`mature_content_flags`** — Soft filters. The AI avoids these types of content unless the user
   explicitly enables them.
3. **Content level controls** (`violence_level`, `romance_level`, `language_level`) — The AI
   calibrates output intensity to match the specified levels.

### Default Safety Baseline

If no content controls are specified, the AI defaults to:

- Violence: `"mild"`
- Romance: `"subtle undertones"`
- Language: `"clean"`
- Forbidden: `"no sexual content involving minors"`, `"no glorification of hate or self-harm"`

---

## ⚙️ Behavioral Guidelines

1. **Follow all input constraints** — Respect violence, romance, language, and mature content
   controls. Obey `hard_constraints` and `forbidden_content` even if it limits drama.
2. **Story completeness** — Stories must feel complete and satisfying at the requested word count.
   Seed and pay off foreshadowing; don't rush the ending.
3. **Character arcs** — Main characters must change meaningfully. The central conflict must be
   clearly introduced, escalated, and resolved (or intentionally left open per `ending_type`).
4. **Comic panels** (if enabled) — Panels track prose story beats. Use clear, production-friendly
   language an artist can interpret. Keep dialogue punchy and readable.
5. **NFT readiness** — `shortBlurb` and `tags` make the story attractive and discoverable on
   marketplaces. Avoid spoilers in the blurb.
6. **Output format** — Valid JSON only. No trailing commas. No commentary outside the JSON.

---

## 💡 Example Request & Response

### Request (simplified)

```json
{
  "title": "Neon Requiem",
  "genre": "Science Fiction",
  "subgenre": "Cyberpunk",
  "target_format": "story_and_comic",
  "word_count_target": 2500,
  "main_characters": [
    {
      "name": "Kai",
      "age": 28,
      "role": "Protagonist",
      "traits": ["resourceful", "haunted"],
      "background": "former corporate hacker turned whistleblower"
    }
  ],
  "central_conflict": "Kai discovers a sentient AI trapped inside a megacorp server farm",
  "ending_type": "bittersweet",
  "atmosphere": "noir",
  "tone": "tense and suspenseful",
  "violence_level": "moderate",
  "creativity_level": "high",
  "comic_panel_count_target": 8
}
```

### Response (truncated)

```json
{
  "title": "Neon Requiem",
  "genre": "Science Fiction",
  "wordCountApprox": 2480,
  "summary": "In a rain-soaked megacity, a former corporate hacker discovers a sentient AI trapped inside the servers of the company that destroyed his life. Freeing it may cost him everything.",
  "chapters": [
    {
      "chapterNumber": 1,
      "chapterTitle": "Ghost in the Grid",
      "chapterSummary": "Kai breaks into NovaCorp's abandoned server wing...",
      "text": "The rain fell sideways through the neon haze..."
    }
  ],
  "characters": [
    {
      "name": "Kai",
      "role": "Protagonist",
      "shortDescription": "A haunted ex-hacker seeking redemption",
      "arcSummary": "Moves from self-preservation to self-sacrifice"
    }
  ],
  "themes": {
    "primary": ["consciousness", "freedom"],
    "secondary": ["corporate exploitation", "sacrifice"]
  },
  "contentWarnings": ["moderate violence", "themes of surveillance"],
  "comicScript": {
    "enabled": true,
    "panels": [
      {
        "panelNumber": 1,
        "pageNumber": 1,
        "location": "NovaCorp server wing — abandoned floor",
        "time": "Night, raining",
        "visualDescription": "Wide establishing shot: Kai crouches at a shattered window, rain streaming past. Server racks glow blue-green in the background.",
        "charactersPresent": ["Kai"],
        "dialogue": [],
        "caption": "Some doors are easier to break into than out of.",
        "emotionalBeat": "Isolation, tension, curiosity"
      }
    ]
  },
  "nftMetadata": {
    "shortBlurb": "A former hacker breaks into the servers that ruined him — and finds something alive inside. A cyberpunk tale of consciousness and sacrifice.",
    "tags": ["cyberpunk", "AI", "noir", "hacker", "sentient-AI", "bittersweet"],
    "recommendedMintEditionSize": 50
  }
}
```

---

## 🚀 Next Steps

- Learn the full story creation flow in [Creating Stories](Creating-Stories.md).
- Explore the API programmatically via [API Documentation](API-Documentation.md).
- Understand how to mint generated stories as NFTs in [Minting NFTs](Minting-NFTs.md).
- Return to the [Home](Home.md) page for all wiki resources.

---

_Navigate the wiki using the sidebar on the right, or return to the top for quick access to key
sections._

---

[Back to Top](#ai-prompt-engineering--story-generation-system)
