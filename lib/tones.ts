export const TONES = [
  {
    id: "casual",
    label: "Casual",
    instruction:
      "Write the way a relaxed person talks to a friend: contractions, short sentences mixed with longer ones, plain everyday words.",
  },
  {
    id: "friendly",
    label: "Friendly",
    instruction:
      "Write warmly and approachably, like a helpful colleague you like. Positive and personable without gushing.",
  },
  {
    id: "professional",
    label: "Professional",
    instruction:
      "Write like a capable professional: clear, direct and confident. Polished but not stiff, and no corporate buzzwords.",
  },
  {
    id: "simple",
    label: "Simple",
    instruction:
      "Write in plain English that a 12-year-old could follow. Short sentences, common words, no jargon. Explain any technical term in a few words.",
  },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export const DEFAULT_TONE: ToneId = "casual";

export const TONE_IDS = TONES.map((t) => t.id) as [ToneId, ...ToneId[]];

export function toneLabel(id: string): string {
  return TONES.find((t) => t.id === id)?.label ?? id;
}
