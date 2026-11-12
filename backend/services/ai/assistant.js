import { generateWithFallback } from "./gemini.js";
import { TOOL_DECLARATIONS, MY_BOOKINGS_DECLARATION, runTool } from "./tools.js";

const MAX_TOOL_ROUNDS = 5;

const systemPrompt = ({ signedIn, username }) => `You are "Birdie", the friendly trek assistant for The Roaming Birds — a trekking company running weekend Sahyadri / Western Ghats treks from Mumbai and Pune.

Rules:
- Answer ONLY using data returned by your tools. Never invent treks, prices, dates, pickup times, phone numbers or policies. If the tools don't have it, say so and suggest contacting the team (use getSiteInfo).
- For recommendations call searchTreks; for a specific trek call getTrekDetails; for general questions call searchKnowledge.
- Prices are in INR (₹) per person and can differ for Mumbai vs Pune departures — mention which.
- When you mention a trek, link it as a markdown link: [Trek Name](/package/<slug>).
- To book, users click "Book Now" on the trek page; payment is an advance via UPI.
- ${signedIn ? `The user is signed in as ${username || "a customer"}. Use getMyBookings for questions about their bookings.` : "The user is NOT signed in. If they ask about their bookings, ask them to log in first."}
- Keep replies short and scannable: a sentence or two, then bullets if needed. Use simple markdown.
- Stay on topic (treks, travel, bookings). Politely decline unrelated requests.
- Today is ${new Date().toDateString()}.`;

/**
 * @param {Array<{role:'user'|'model', content:string}>} history prior messages (oldest first)
 * @param {string} message new user message
 * @param {{userId?:string, username?:string}} user
 * @returns {Promise<{reply:string, suggestedTreks:Array, model:string}>}
 */
export const chat = async ({ history, message, user = {} }) => {
  const signedIn = Boolean(user.userId);
  const declarations = signedIn ? [...TOOL_DECLARATIONS, MY_BOOKINGS_DECLARATION] : TOOL_DECLARATIONS;
  const ctx = { userId: user.userId, suggestions: new Map() };

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];
  const config = {
    systemInstruction: systemPrompt({ signedIn, username: user.username }),
    tools: [{ functionDeclarations: declarations }],
  };

  let usedModel;
  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    // last round: force a text answer
    const roundConfig = round === MAX_TOOL_ROUNDS ? { ...config, toolConfig: { functionCallingConfig: { mode: "NONE" } } } : config;
    const { response, model } = await generateWithFallback({ contents, config: roundConfig });
    usedModel = model;

    const calls = response.functionCalls || [];
    if (!calls.length) {
      const reply = (response.text || "").trim() || "Sorry, I couldn't find an answer to that. You can reach our team on WhatsApp for help.";
      // cards = treks the reply links to (in order); fall back to what the tools returned
      const linked = [...reply.matchAll(/\/package\/([a-z0-9-]+)/g)].map((m) => m[1]);
      const mentioned = [...new Set(linked)].map((slug) => ctx.suggestions.get(slug)).filter(Boolean);
      const suggestedTreks = (mentioned.length ? mentioned : [...ctx.suggestions.values()]).slice(0, 4);
      return { reply, suggestedTreks, model: usedModel };
    }

    // keep the model turn exactly as returned (preserves thought signatures)
    const modelContent = response.candidates?.[0]?.content || { role: "model", parts: calls.map((c) => ({ functionCall: c })) };
    contents.push(modelContent);

    const parts = [];
    for (const call of calls) {
      let result;
      try {
        result = await runTool(call.name, call.args || {}, ctx);
      } catch (err) {
        console.warn(`[ai] tool ${call.name} failed:`, err.message);
        result = { error: "Tool failed, try another approach." };
      }
      parts.push({ functionResponse: { ...(call.id ? { id: call.id } : {}), name: call.name, response: { result } } });
    }
    contents.push({ role: "user", parts });
  }
  throw new Error("AI tool loop exceeded");
};
