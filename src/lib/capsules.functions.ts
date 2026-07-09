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

export const createCapsule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { callGatewayJson } = await import("./ai-gateway.server");

    const structured = await callGatewayJson<StructuredCapsule>({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Source AI: ${data.sourceAi ?? "unknown"}\n\nConversation:\n\n${data.raw}`,
        },
      ],
      jsonSchema: { name: "capsule", schema: CAPSULE_SCHEMA as unknown as Record<string, unknown> },
    });

    const markdown = toMarkdown(structured);
    const tokensOriginal = estimateTokens(data.raw);
    const tokensCompressed = estimateTokens(markdown);

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
