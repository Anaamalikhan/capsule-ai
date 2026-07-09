// Server-only helper for calling the Lovable AI Gateway.
// Do NOT import this from client-reachable modules.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callGatewayJson<T = unknown>(params: {
  model: string;
  messages: ChatMessage[];
  jsonSchema?: {
    name: string;
    schema: Record<string, unknown>;
  };
}): Promise<T> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const body: Record<string, unknown> = {
    model: params.model,
    messages: params.messages,
  };
  if (params.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: params.jsonSchema.name,
        strict: true,
        schema: params.jsonSchema.schema,
      },
    };
  } else {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402)
      throw new Error("AI credits exhausted for this workspace. Add credits to continue.");
    throw new Error(`AI gateway failed [${res.status}]: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}
