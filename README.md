# 🎂 Sakina's Birthday Site

A teeny, tiny, very wholesome Next.js site for Sakina's birthday on **May 5, 2026** — from her husband Abbas and their brand-new daughter **Insiya** (b. April 2, 2026).

## What's inside

- 🎈 **Animated hero** with parallax scroll, wiggling emojis, and a "press for confetti" button
- ⏳ **Live countdown** to May 5 (auto-celebrates when it hits zero)
- 📜 **"Important Birthday Facts™"** card with stagger-in animations
- 💌 **Letter from Insiya** — typewriter-animated love note from your 1-month-old
- 💖 **Heart-popping mini game** — every heart triggers confetti + a tiny compliment
- 🎁 **Tap-to-open present reveal** — five wholesome surprises with a final cinematic moment
- 🌸 Floating background emojis (hearts, baby bottles, sparkles, unicorns)
- 🎀 Pastel color palette + handwritten Caveat font

## Run it

```bash
cd sakinas-birthday
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Tech

- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion (animations + scroll effects)
- canvas-confetti (because of course)
- TypeScript

## How to make it more personal

- Edit the letter copy in `components/BabyLetter.tsx`
- Change the surprise gifts in `components/BirthdayReveal.tsx`
- Add real photos to a new section in `app/page.tsx`
- Tweak the pastels in `tailwind.config.ts` and `app/globals.css`

Made with extremely tired love. 💕
