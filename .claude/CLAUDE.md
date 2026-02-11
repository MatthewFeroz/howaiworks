# CLAUDE.md — howaiworks.io

## What This Is

howaiworks.io is an interactive AI education tool being submitted to the **NVIDIA GTC 2026 Golden Ticket Competition** (deadline: February 15, 2026). The moment someone lands on this page, they should understand something true about AI that they didn't know 10 seconds ago — by experiencing it themselves, not reading about it.

**Submitter:** Matt Feroz (howaiworks.io)
**Narrative hook:** Matt asked on an NVIDIA Developer Livestream (04:12-05:55 in https://www.youtube.com/watch?v=nRo-tQC-mEY): "Is AI literacy a hardware problem or a software education problem?" NVIDIA said DGX Spark solves the hardware side. howaiworks.io is the software side.

## Competition Context

**Judging criteria (equally weighted, scored 1-10):**
- (a) Technical innovation
- (b) Effective use of NVIDIA/partner technology (Ollama, HuggingFace)
- (c) Potential impact on developers/end users
- (d) Quality of documentation and presentation

**Key judges:**
- Nader Khalil — Co-founder Brev.dev (acquired by NVIDIA). Cares about one-click deployment. Make this a Brev Launchable.
- Sabrina Koumoin — NVIDIA engineer, self-taught coder from Ivory Coast, founder Brina's Code. Cares about accessible education.
- Bryan Catanzaro — VP Applied Deep Learning Research at NVIDIA. Wants technical substance.
- Carter Abdallah — NVIDIA Developer Relations.

**Primary audience:** University CS students (intro AI/NLP courses). Secondary: high school teachers, self-taught devs, curious people. Content must be accessible on the surface but have university-level depth in the "Go Deeper" panels.

## The Hero Experience (CURRENT SOLE PRIORITY)

### The Concept

The entire landing page IS the experience. No "welcome" screen. No explainer paragraph. You land, you see a provocation, you type, you learn.

**Headline:** "AI has never read a word in its life."
**Subline:** "Type anything. See what it actually sees."

Below the headline is a chat-bar-style input that looks familiar (like ChatGPT's input). But the moment you start typing, something unexpected happens: your text is live-tokenized on every keystroke. Inside the input itself, each token is colorized — there is no "normal text" state. The user is always seeing the AI's view. Below the input, colored token pills accumulate as you type, stable and non-flashing. Only new/changed tokens animate in.

A pre-filled typing animation plays on load: **"How does AI work?"** types itself out character by character, tokenizing in real-time, so the user sees the effect before they touch anything. After it finishes, a subtle prompt invites them to clear it and try their own words.

### Interaction Design Spec

1. **On page load:**
   - Headline and subline fade in (fast — 0.5s total, not slow and dramatic)
   - Chat bar appears empty, then the auto-type animation begins: "How does AI work?" types at ~60ms per character
   - As each character lands, the tokenizer runs. Inside the input, text is colorized by token boundaries in real-time. Below the input, token pills appear and stay stable — only new tokens slide in
   - After auto-type finishes (~1.5s), a brief pause, then a soft nudge appears: "Now try your own words" or a blinking cursor prompt

2. **On user input:**
   - User clicks/taps the input, clears the pre-filled text, and starts typing
   - Tokenization happens on every keystroke (live, Option B style)
   - Inside the input: text is colorized by token — no "normal" state ever exists. This is the X-ray vision effect
   - Below the input: token pills render. Existing pills stay perfectly still. Only new/changed pills get a subtle slide-in animation. NO full re-render flash
   - A blinking green cursor follows the last character inside the input

3. **Stats bar (appears after first user input):**
   - Token count, character count, chars/token ratio
   - Fades in gently, doesn't steal attention from the tokens

4. **Nudges (appear progressively after user starts exploring):**
   - Clickable suggestions: "Try: strawberry", "Try: Schwarzenegger", "Try: こんにちは世界"
   - Each nudge demonstrates a different tokenizer behavior (subword splitting, long words, multilingual)
   - Nudges appear staggered — not all at once. First nudge after 1st input, more after continued exploration

5. **Insight card (appears after ~3 inputs):**
   - A brief educational callout: e.g., "Notice how 'strawberry' becomes 3 tokens? AI doesn't see words — it sees fragments called tokens. Every AI model starts here."
   - This is the "aha" moment in text form, reinforcing what the user just experienced visually

6. **Go Deeper panel (appears after ~4 inputs):**
   - Collapsible panel with CS-level depth: BPE explanation, tiktoken code snippet, multilingual tokenization challenge, tokenization as bias origin
   - Surface experience works for anyone. Depth is opt-in

### Visual Spec

```
The input should look like a modern chat bar:
- Rounded corners (12px), dark surface (#141416), subtle border (#2a2a30)
- On focus: border transitions to NVIDIA green (#76B900)
- Font: IBM Plex Mono inside the input (monospace reinforces "this is code/data")
- Token colors: 12-color palette, applied to both inline text and pills below
- No background highlight on inline tokens — just color change. Clean, not noisy
- Pills below: subtle background tint (color at 13% opacity), colored border, colored text
- Cursor: 2px wide, NVIDIA green, blinking

The overall page:
- Dark background (#0a0a0b)
- Centered single-column layout, max-width ~600px
- Headline large and bold (Outfit 700), subline in secondary gray
- Generous whitespace. Let the interaction breathe
- No sidebar, no nav, no footer clutter during the hero experience
```

### What "Done" Looks Like for the Hero

- [ ] Page loads and auto-types "How does AI work?" with live tokenization
- [ ] User can clear and type their own text with zero-latency live tokenization
- [ ] Tokens colorize inside the input on every keystroke (Option B — no "normal" state)
- [ ] Token pills below are stable — no flashing on re-render, only new tokens animate
- [ ] Stats bar fades in after first input
- [ ] At least 3 nudges appear progressively and work when clicked
- [ ] Insight card appears after ~3 inputs with a clear educational takeaway
- [ ] Go Deeper panel appears after ~4 inputs with BPE explanation and code
- [ ] The entire experience feels smooth, snappy, and produces an "aha" within 10 seconds
- [ ] Works fully client-side with zero backend (js-tiktoken, cl100k_base)

## Tech Stack

- **Frontend:** React 19 + Vite 6
- **Tokenizer:** js-tiktoken (cl100k_base, GPT-4's tokenizer) — runs client-side, no backend needed
- **Animations:** Framer Motion
- **Design:** Dark theme, NVIDIA green (#76B900) accents, IBM Plex Mono + Outfit fonts

## Project Structure (Relevant to Hero)

```
howaiworks-io/
├── CLAUDE.md
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # Orchestrates hero experience, manages state
│   ├── hooks/
│   │   └── useTokenizer.js        # js-tiktoken hook — lazy loads encoder, tokenizes on keystroke
│   ├── components/
│   │   ├── Hero.jsx               # Headline + subline + auto-type animation
│   │   ├── TokenInput.jsx         # The chat-bar input with live inline colorization
│   │   ├── TokenPills.jsx         # Stable pill display below input, only new pills animate
│   │   ├── StatsBar.jsx           # Token count, char count, ratio (fades in after first input)
│   │   ├── Nudge.jsx              # Clickable suggestion prompts
│   │   ├── Insight.jsx            # Educational callout card
│   │   ├── DepthPanel.jsx         # Expandable "Go Deeper" with BPE, code, challenge
│   │   └── TokenBlock.jsx         # Single token with color (used by TokenInput and TokenPills)
│   └── styles/
│       └── globals.css            # CSS variables, dark theme, token colors
```

## Design System

```
Colors:
  --bg-deep:           #0a0a0b
  --bg-surface:        #141416
  --bg-elevated:       #1c1c20
  --nvidia-green:      #76B900
  --nvidia-green-dim:  rgba(118,185,0,0.15)
  --text-primary:      #e8e8ed
  --text-secondary:    #8a8a96
  --text-dim:          #55555f
  --border:            #2a2a30

Fonts:
  Body:  'Outfit' (weights: 300-700)
  Mono:  'IBM Plex Mono' (weights: 400-600)

Token colors: 12-color palette
  #76B900, #00b4d8, #e0aaff, #ffd166, #ef476f, #06d6a0,
  #118ab2, #f78c6b, #83c5be, #b5179e, #7209b7, #f4a261
```

## Commands

```bash
npm install
npm run dev              # Frontend on :3000
```

## Key Constraints

- **5-day deadline** (Feb 10-15, ~20 hours total). The hero must be polished and impactful.
- **Judges have 60 seconds of attention.** The first interaction must produce an aha moment within 10 seconds.
- **Must work without backend.** The hero is fully client-side via js-tiktoken. Zero dependencies on a running server.
- **No flashing or visual agita.** Token pills must be stable on re-render. Only new/changed tokens animate. This is critical for the typing feel.

## Phase 2 + 3 (LATER — not current priority)

Phase 2 (Token IDs / "human view vs AI view") and Phase 3 (Embedding Map with Ollama) are built after the hero experience is locked. They extend the hero, they don't replace it. Specs for those phases exist in the git history and will be resurrected when the hero is done.

## Architecture Decisions

- **js-tiktoken client-side:** Phases 1-2 work with zero backend. Judges can open the site and immediately interact.
- **Single-page progressive reveal:** No clicking through menus. Type → discover → go deeper.
- **Option B tokenization (live, no "normal" state):** The user never sees plain text. From the first keystroke, they're seeing the AI's view. This is the core insight made visceral.
- **Stable pill rendering:** innerHTML replacement causes flash. The pill renderer must diff against previous tokens and only animate genuinely new entries. This is a hard requirement, not a nice-to-have.
- **cl100k_base encoding:** GPT-4's actual tokenizer. Using the real thing matters for credibility.
- **Framer Motion:** AnimatePresence for enter/exit, layout animations. Worth the bundle for the polish.

## Code Style

- React functional components with hooks
- Inline styles preferred over CSS modules (self-contained components)
- Framer Motion for all animations
- No TypeScript (time constraint)
- Component files are self-contained: each component owns its styles and logic