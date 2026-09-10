import type { Chapter, Scene, Work } from "./types";

const now = 1_746_000_000_000;

export const SEED_WORK_ID = "work-saltglass";

export function seedWork(): Work {
  return {
    id: SEED_WORK_ID,
    title: "Saltglass",
    folderName: "Saltglass",
    logline:
      "A kiln-worker who traps memories in glass accepts one commission she should have refused.",
    createdAt: now,
    updatedAt: now,
    lastSceneId: "sc-01",
    project: `Title: Saltglass
Form: Novel, close third, present tense
Promise: Memory can be stored, but storage is not the same as keeping.

Do nots:
- No comedy sidekick
- No explaining the craft like a Wikipedia article
- Mira does not cry on the page in Act I
- The sea is weather and work, not a metaphor dump

Tone: Quiet, physical, slightly feral. The magic is a trade, not a miracle.`,
    style: `Close third on Mira. Present tense.
Short sentences when she works. Longer when she thinks and hates that she is thinking.
No filter stacks (she saw, she felt, she noticed).
Dialogue is clipped. People interrupt. No witty banter.
Sensory load: heat, salt, silica dust, the click of cooling glass.
Do not summarize emotion. Put it in the hands.`,
    memoryUser: `Writer works scene-by-scene. Each scene is a file. Compile only when the chapter is ready.
Keep the bible sacred. Ask before changing canon.
Prefer continuing from the cursor over rewriting the whole scene.`,
    memoryStory: `Mira Vale blows memory-glass at the old kiln on Cinder Quay.
A memory sealed in glass can be looked at, never lived again, unless the vessel cracks.
Orren Vetch commissioned a vessel for a memory he will not name.
The first piece from that commission has a hairline fault Mira has not admitted.`,
    memoryWorld: `The city is Brack. Fishing, glass, and a quiet guild that licenses memory-work.
Unlicensed trapping is a dock crime, not a fairy-tale curse.
Memory-glass looks like ordinary glass until it is warm.`,
    bible: [
      {
        id: "char-mira",
        kind: "character",
        name: "Mira Vale",
        slug: "mira-vale",
        summary: "Kiln-worker. Licensed, barely. Hands always nicked.",
        voice:
          "Few words. Dry. Will not perform gratitude. Asks practical questions and lets silence do the rest.",
        secrets: "She trapped one of her own memories years ago and buried the vessel under the kiln floor.",
        body: "Thirty-two. Lives above the shop. Eats standing. Trusts heat more than people. Does not believe in clean grief.",
      },
      {
        id: "char-orren",
        kind: "character",
        name: "Orren Vetch",
        slug: "orren-vetch",
        summary: "Client. Pays in coin that still smells like a ship.",
        voice:
          "Polite in a way that wastes time. Soft consonants. Never says the dead person's name.",
        secrets: "The memory is not grief. It is a crime he wants stored so he can pretend he is not still doing it.",
        body: "Forties. Fine coat that does not fit the quay. Knows just enough of the guild rules to be dangerous.",
      },
      {
        id: "loc-kiln",
        kind: "location",
        name: "Cinder Quay kiln",
        slug: "cinder-quay-kiln",
        summary: "Mira's shop. Heat, salt air, a floor that never quite dries.",
        voice: "",
        secrets: "A sealed vessel under the left firebrick.",
        body: "One room and a loft. The glory hole faces the harbour so the draft works. Windows are filmed with silica.",
      },
      {
        id: "loc-harbor",
        kind: "location",
        name: "Brack Harbour",
        slug: "brack-harbour",
        summary: "Working water. Not pretty unless the light lies.",
        voice: "",
        secrets: "",
        body: "Tides leave a white crust on the bollards. Memory-work is done inland by people with better manners. Mira stayed on the quay on purpose.",
      },
    ],
    arcs: [
      {
        id: "arc-1",
        order: 1,
        title: "The Commission",
        slug: "the-commission",
        summary: "Orren hires Mira. She takes the work. The first vessel is wrong and she ships it anyway.",
        notes: "Ch 1 kiln meeting. Ch 2 the blow. Ch 3 delivery.",
      },
      {
        id: "arc-2",
        order: 2,
        title: "The Leak",
        slug: "the-leak",
        summary: "The fault opens. Mira starts living slivers of a memory that is not hers. Orren wants it recast, not destroyed.",
        notes: "Keep the leaked memory sensory and incomplete. Do not dump the crime.",
      },
      {
        id: "arc-3",
        order: 3,
        title: "The Recast",
        slug: "the-recast",
        summary: "Mira decides whether storage is a kindness or a weapon. The kiln floor comes up.",
        notes: "Her buried vessel is the price, not a twist-for-twist's-sake.",
      },
    ],
  };
}

export function seedChapters(): Chapter[] {
  return [
    {
      id: "ch-01",
      workId: SEED_WORK_ID,
      arcId: "arc-1",
      order: 1,
      title: "Heat Takes a Name",
      slug: "heat-takes-a-name",
      status: "drafting",
      compiledBody: "",
      compiledAt: null,
      breakdown: `Scene 1 — Arrival: Orren in the kiln doorway. He will not sit. Mira does not offer.
Scene 2 — Terms: What can be trapped, what cannot, the fee, the lie about the hairline.
Scene 3 — After: Mira alone with the pipe. She almost refuses. She does not.`,
    },
  ];
}

export function seedScenes(): Scene[] {
  return [
    {
      id: "sc-01",
      workId: SEED_WORK_ID,
      chapterId: "ch-01",
      order: 1,
      title: "The Doorway",
      slug: "the-doorway",
      goal: "Establish Mira's work, Orren's wrongness, the commission as a bad idea she will take.",
      pov: "Mira",
      status: "draft",
      body: `The glory hole breathes like an animal that has learned patience. Mira turns the pipe anyway, wrist loose, gathering the gather, and does not look at the door until the man has been in it long enough to count as a problem.

"You're Vale," he says.

"I'm working." The glass is still a lung. If she answers him properly it will fall in on itself and she will have wasted a morning on courtesy.

He steps in without asking. Salt on the coat. Coin-weight in the way he stands, as if the floor should be grateful. The kiln makes everyone sweat; he does not. That is worse.

"I need a vessel," he says. "Licensed work. I can pay above the quay rate."

Mira seats the pipe on the yoke and rolls. The gather cools a skin. She can hear the harbour through the film on the window, a slap of water that does not care about rates.

"Guild hall is inland," she says. "They like paper. They like sitting down."

"I asked for you."

She looks at him then, because that is the first true thing he has offered. He has a polite mouth and eyes that have already left the room. Not grief. Grief stares. This is storage.

"Name," she says.

"Orren Vetch."

"The memory's name."

He smiles as if she has made a joke in a language he does not owe her. "It doesn't need one."

Mira marvers the gather. Heat crawls her forearms. The pipe is honest; men in good coats are not.

"Everything I trap needs a name," she says. "Glass without a name cracks for spite."

"Then give it one of yours." He sets a purse on the bench, careful not to touch the soot. "I was told you don't ask what it is."

She was told that too, by herself, in a year she does not visit.

The gather is ready. She can still refuse. The refusal would be a clean motion: pipe to the bucket, steam, done. She watches the purse instead. Rent. Cullet. A new block for the door that never seals.

"Sit or don't," Mira says. "Don't talk while I blow. If you talk, the thing will hear you, and I charge extra for witnesses."`,
    },
    {
      id: "sc-02",
      workId: SEED_WORK_ID,
      chapterId: "ch-01",
      order: 2,
      title: "Terms",
      slug: "terms",
      goal: "Lock the deal. Show the craft without a lecture. Plant the fault.",
      pov: "Mira",
      status: "draft",
      body: `He does not sit. He watches the blow as if it were a trick done for children.

Mira breathes into the pipe. The gather opens, a cheek, a bowl. She has done this with grief, with weddings, with a sailor who wanted his mother's voice kept where the damp could not get it. Those memories arrived as heat in the client's hands. Orren keeps his hands in his coat.

"You hold it," she says, after the third gather. "Not the glass. The thing. If you don't hold it, I trap air and you still pay."

He takes one hand out. The palm is uncalloused and shaking in a small, expensive way. When she nods, he closes his eyes.

The kiln drops a degree. That is how she knows it is real. Memory pulls heat. Always. The gather clouds, then clears to a thickness that is not glass and not water. Mira turns. She does not look into it. Looking is how you get stained.

A hairline shows near the punty. Thin as a lie. She can still put it back in the fire and wash the fault out. She does not. The purse is already on the bench. He is already somewhere else.

"It will hold," she says, which is not the same as it will hold forever.

Orren opens his eyes. For a second the politeness is gone and something younger looks out, furious at being seen. Then he is a customer again.

"When."

"Tomorrow. Cold. Wrapped. You don't warm it. You don't show it the sea."

"And if it breaks."

Mira scores the neck. "Then you live it. That's the fee you didn't pay."`,
    },
    {
      id: "sc-03",
      workId: SEED_WORK_ID,
      chapterId: "ch-01",
      order: 3,
      title: "After Hours",
      slug: "after-hours",
      goal: "Mira alone. Temptation to smash the purse-job. She locks the door instead.",
      pov: "Mira",
      status: "outline",
      body: "",
    },
  ];
}
