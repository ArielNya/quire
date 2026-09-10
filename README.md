# Quire

A mobile-first manuscript desk. One folder per work. Bible and arcs first. Chapters are folders. Scenes are files. Compile a chapter when it is actually ready.

Quire is a writing assistant, not a coding tool. The partner talks in prose, beats, and canon — never in filesystems or shells.

## Folder model

Each work is its own tree:

```
Saltglass/
  PROJECT.md
  STYLE.md
  memory/
    USER.md
    STORY.md
    WORLD.md
  bible/
    characters/
    locations/
    other/
  arcs/
    01-the-commission.md
  chapters/
    01-the-order/
      BREAKDOWN.md
      CHAPTER.md          # compiled from scenes
      scenes/
        01-kiln-floor.md
        02-the-brief.md
```

You draft scene by scene. Compile stitches those scene files into `CHAPTER.md` with `* * *` between them.

## Workflow

1. Open a work (or start a new one).
2. Fill the bible and the arc list before you draft.
3. Add a chapter folder, then a scene file.
4. Write the scene. Ask the partner to continue, rewrite, check canon, or break the chapter into beats.
5. Accept a take into the scene, or keep writing yourself.
6. Compile when the chapter’s scenes are in order.

Manuscripts live on this device (browser storage). Export from the desk dumps the folder tree as text.

## Connection

The partner needs your own API key. Open **Connection** on the shelf (or the gear inside a work).

Defaults:

- URL: `https://api.deepseek.com/v1`
- Model: `deepseek-chat`

Paste a DeepSeek key, then **Load models**. The selector fills from that host’s `/models` list. Any OpenAI-compatible chat-completions URL works — OpenRouter, a local server, another lab.

The key stays on this device. It is never written into the repo.

## Run locally

```bash
npm install
npm run dev
```

Dev server: `http://localhost:8080`

```bash
npm run typecheck
npm run build
```

## Stack

TanStack Start, React, Tailwind, Zustand. Partner calls go through a server function to your chosen OpenAI-compatible endpoint.

## License

Private work unless you say otherwise. The sample work **Saltglass** is demo fiction only.
