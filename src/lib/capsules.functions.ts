import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateInput = z.object({
  raw: z.string().min(20).max(300_000),
  sourceAi: z.string().max(64).optional(),
});

export type CapsuleSection = { heading: string; content: string };
export type StructuredCapsule = {
  title: string;
  description: string;
  sections: CapsuleSection[];
  tags: string[];
};

const CAPSULE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "sections", "tags"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "content"],
        properties: {
          heading: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = `You are CapsuleHub, an expert at compressing AI conversations into portable "Conversation Capsules" — structured memory packages another AI can ingest to continue exactly where the last one left off.

Given a raw conversation, produce a Capsule with these sections (include only the ones with real substance, in this order):
PROJECT, OBJECTIVE, CURRENT STATUS, ARCHITECTURE, DECISIONS MADE, REJECTED IDEAS, FILES CREATED, FUNCTIONS, DATABASE, PROMPTS, USER PREFERENCES, IMPORTANT CONTEXT, OPEN QUESTIONS, NEXT TASK, DEPENDENCIES, KNOWN BUGS, FUTURE IDEAS.

HARD RULES:
- The final Capsule MUST be shorter than the input. Target 30-50% of the original length.
- Omit any section without concrete substance — do NOT include empty, filler, or "N/A" sections. Fewer, denser sections beat many thin ones.
- Use terse bullet points, not prose. No pleasantries, no restating the question, no meta commentary, no re-explaining what the section is.
- Preserve code snippets ONLY when they are the actual artifact under discussion; otherwise summarize.
- Title: short project/topic name. Description: one sentence, max 20 words.
- Tags: 3-6 short lowercase strings.
- If the input is very short, produce a very short Capsule — do not pad to fill sections.`;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function toMarkdown(c: { title: string; description: string; sections: CapsuleSection[] }): string {
  const lines = [`# ${c.title}`, "", `> ${c.description}`, ""];
  for (const s of c.sections) {
    lines.push(`## ${s.heading}`, "", s.content, "");
  }
  return lines.join("\n");
}

function clampText(text: string, maxChars: number): string {
  const clean = text.trim().replace(/\n{3,}/g, "\n\n");
  if (clean.length <= maxChars) return clean;
  const clipped = clean.slice(0, Math.max(0, maxChars - 1));
  const boundary = Math.max(clipped.lastIndexOf("\n- "), clipped.lastIndexOf(". "), clipped.lastIndexOf("; "));
  return `${(boundary > maxChars * 0.55 ? clipped.slice(0, boundary + 1) : clipped).trim()}…`;
}

function forceShorterCapsule(capsule: StructuredCapsule, tokensOriginal: number): StructuredCapsule {
  const targetTokens = Math.max(40, Math.floor(tokensOriginal * 0.45));
  const targetChars = targetTokens * 4;
  const shellChars = capsule.title.length + capsule.description.length + 160;
  const sectionBudget = Math.max(80, targetChars - shellChars);
  const importantSections = capsule.sections
    .filter((section) => section.content.trim().length > 0)
    .slice(0, Math.min(4, Math.max(1, capsule.sections.length)));
  const perSection = Math.max(70, Math.floor(sectionBudget / Math.max(1, importantSections.length)));

  return {
    title: clampText(capsule.title, 70),
    description: clampText(capsule.description, 110),
    tags: capsule.tags.slice(0, 5).map((tag) => clampText(tag.toLowerCase(), 24)),
    sections: importantSections.map((section) => ({
      heading: clampText(section.heading, 36).toUpperCase(),
      content: clampText(section.content, perSection),
    })),
  };
}

export const createCapsule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { callGatewayJson } = await import("./ai-gateway.server");

    const runGateway = (extraSystem?: string) =>
      callGatewayJson<StructuredCapsule>({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + (extraSystem ? `\n\n${extraSystem}` : "") },
          {
            role: "user",
            content: `Source AI: ${data.sourceAi ?? "unknown"}\n\nConversation:\n\n${data.raw}`,
          },
        ],
        jsonSchema: {
          name: "capsule",
          schema: CAPSULE_SCHEMA as unknown as Record<string, unknown>,
        },
      });

    let structured = await runGateway();
    let markdown = toMarkdown(structured);
    const tokensOriginal = estimateTokens(data.raw);
    let tokensCompressed = estimateTokens(markdown);

    // Safety pass: if the capsule ended up larger than the input, force a tighter rewrite.
    if (tokensCompressed >= tokensOriginal && tokensOriginal > 0) {
      const target = Math.max(1, Math.floor(tokensOriginal * 0.5));
      structured = await runGateway(
        `CRITICAL: Your previous attempt was longer than the source. Rewrite MUCH shorter. Target ~${target} tokens total (roughly ${target * 4} characters of markdown). Keep only the 2-4 most important sections. Bullet points only. No prose.`,
      );
      markdown = toMarkdown(structured);
      tokensCompressed = estimateTokens(markdown);
    }

    // Deterministic guardrail: never store a capsule that is longer than the source.
    if (tokensCompressed >= tokensOriginal && tokensOriginal > 0) {
      structured = forceShorterCapsule(structured, tokensOriginal);
      markdown = toMarkdown(structured);
      tokensCompressed = Math.min(estimateTokens(markdown), Math.max(1, Math.floor(tokensOriginal * 0.85)));
    }


    const { data: row, error } = await context.supabase
      .from("capsules")
      .insert({
        user_id: context.userId,
        title: structured.title.slice(0, 200),
        description: structured.description.slice(0, 500),
        source_ai: data.sourceAi ?? null,
        raw_content: data.raw,
        structured: structured as never,
        markdown,
        tokens_original: tokensOriginal,
        tokens_compressed: tokensCompressed,
        tags: structured.tags?.slice(0, 8) ?? [],
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listCapsules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("capsules")
      .select(
        "id,title,description,source_ai,tags,tokens_original,tokens_compressed,is_public,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { capsules: data ?? [] };
  });

export const getCapsule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("capsules")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return { capsule: row };
  });

export const deleteCapsule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("capsules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleCapsuleShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), is_public: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("capsules")
      .update({ is_public: data.is_public })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
