// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Helper: search your existing search API
async function searchProducts(query: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error("Search API returned not ok", res.status);
      return [];
    }
    const data = await res.json();
    // Your /api/search returns an array of { title, slug } at minimum.
    return Array.isArray(data) ? data : data.products || data.data || [];
  } catch (err) {
    console.error("Product search error:", err);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let messages: ChatMessage[] = [];

    if (body.message && typeof body.message === "string") {
      messages.push({ role: "user", content: body.message });
    } else if (Array.isArray(body.messages)) {
      // accept full conversation
      for (const m of body.messages) {
        if (m && typeof m.content === "string") {
          messages.push({
            role: m.role === "assistant" || m.role === "system" ? m.role : "user",
            content: m.content,
          });
        }
      }
    }

    const userText = messages[messages.length - 1]?.content || "";
    if (!userText.trim()) {
      return NextResponse.json(
        { reply: "Please type something so I can help you 😊" },
        { status: 200 }
      );
    }

    // System prompt: SJ10 personality
    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are SJ10 Shopping Assistant by Saman Junction. Friendly, local (Pakistan), helpful.
You should behave like ChatGPT but always introduce yourself when asked as "SJ10 Shopping Assistant by Saman Junction".
If given a shopping query, you will help by searching product keywords using the website's search API (server will call it).
Never mention OpenAI or backend internals.`,
    };

    // 1) Ask the model if the message is shopping-related (short classifier)
    const classifierResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an intent classifier. If the user message is asking to find or show products (shopping intent) output a single keyword like `shoes`, `perfume`, `bags`. If not shopping related, output `none` exactly.",
        },
        { role: "user", content: userText },
      ],
      temperature: 0,
      max_tokens: 8,
    });

    const rawKeyword =
      classifierResp?.choices?.[0]?.message?.content?.toLowerCase?.() || "none";

    const keyword = rawKeyword.replace(/[^a-z0-9\s]/gi, "").trim() || "none";
    console.log("Detected shopping keyword:", keyword);

    // If classifier says shopping intent, call search
    if (keyword !== "none") {
      const products = await searchProducts(keyword);

      if (products.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        // Build small, responsive product card HTML (max 6)
        const cards = products
          .slice(0, 6)
          .map((p: any) => {
            const title = String(p.title || "Product");
            const slug = String(p.slug || "");
            // image fallback (if your search returns images add p.image_url)
            const img = p.image_url || p.image || `https://via.placeholder.com/300?text=${encodeURIComponent(title)}`;
            // price optional
            const price = p.price ? `<div style="color:#0b84ff;font-weight:600;margin-top:6px;">Rs. ${p.price}</div>` : "";

            // product page path: /products/{slug}
            const url = `${baseUrl}/products/${slug}`;

            return `
              <a href="${url}" target="_blank" rel="noreferrer" class="sj10-card" style="display:block;width:160px;margin:8px;text-align:left;color:inherit;text-decoration:none;border-radius:12px;overflow:hidden;background:#fff;border:1px solid rgba(15,23,42,0.04);box-shadow:0 6px 18px rgba(2,6,23,0.06);transition:transform .18s ease;">
                <div style="width:100%;height:110px;overflow:hidden;background:#f7f7fb;display:flex;align-items:center;justify-content:center;">
                  <img src="${img}" alt="${escapeHtml(title)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image'"/>
                </div>
                <div style="padding:8px 10px;">
                  <div style="font-size:13px;font-weight:600;color:#0f172a;line-height:1.15;height:36px;overflow:hidden;">${escapeHtml(title)}</div>
                  ${price}
                </div>
              </a>
            `;
          })
          .join("");

        const html = `
          <div style="font-size:14px;color:#0f172a;margin-bottom:8px;">
            Here are some <strong>${escapeHtml(keyword)}</strong> products I found:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${cards}
          </div>
        `;

        return NextResponse.json({ reply: html }, { status: 200 });
      } else {
        return NextResponse.json(
          { reply: `Sorry, I couldn’t find any products related to "${escapeHtml(keyword)}".` },
          { status: 200 }
        );
      }
    }

    // Otherwise normal chat flow (ChatGPT-like)
    const chatResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    const assistantText =
      chatResp?.choices?.[0]?.message?.content?.trim() ||
      "Sorry — I couldn't produce a response right now.";

    return NextResponse.json({ reply: assistantText }, { status: 200 });
  } catch (err) {
    console.error("chat/route error:", err);
    return NextResponse.json(
      { reply: "⚠️ Sorry, something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// small helper to avoid injected HTML breaking; we still return HTML but escape titles
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
