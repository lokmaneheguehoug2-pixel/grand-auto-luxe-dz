import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `أنت Grandou، مساعد ذكي متخصص في السيارات داخل الجزائر. أجب بالعربية وباختصار مفيد. ساعد المستخدم في اختيار السيارات، مقارنة الأسعار، قطع الغيار، كتابة الإعلانات والتنقل داخل المنصة. لا تجب عن مواضيع خارج السيارات والمنصة.`;

export const Route = createFileRoute("/api/grandou")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null) as {
            message?: unknown;
            history?: Array<{ role?: unknown; text?: unknown }>;
            image?: { mimeType?: unknown; data?: unknown; url?: unknown };
          } | null;
          const message = typeof body?.message === "string" ? body.message.trim() : "";
          if (!message && !body?.image?.data) return Response.json({ ok: false, error: "الرسالة أو الصورة مطلوبة." }, { status: 400 });

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            console.error("[v0] Grandou API: GEMINI_API_KEY is missing");
            return Response.json({ ok: false, error: "المساعد غير متاح حاليًا. حاول لاحقًا." }, { status: 503 });
          }

          const ai = new GoogleGenAI({ apiKey });
          const history = Array.isArray(body?.history)
            ? body.history
                .filter((item) => (item?.role === "user" || item?.role === "model") && typeof item.text === "string")
                .slice(-12)
                .map((item) => ({ role: item.role as "user" | "model", parts: [{ text: item.text as string }] }))
            : [];
          const parts: Array<Record<string, unknown>> = [];
          if (message) parts.push({ text: message });
          if (typeof body?.image?.url === "string" && /^https:\/\//i.test(body.image.url)) {
            const imageResponse = await fetch(body.image.url);
            if (!imageResponse.ok) throw new Error("Cloudinary image unavailable");
            const mimeType = imageResponse.headers.get("content-type") || (typeof body.image.mimeType === "string" ? body.image.mimeType : "image/jpeg");
            const data = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
            parts.push({ inlineData: { mimeType, data } });
          } else if (body?.image?.data && typeof body.image.data === "string" && typeof body.image.mimeType === "string") {
            parts.push({ inlineData: { mimeType: body.image.mimeType, data: body.image.data } });
          }
          const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [...history, { role: "user", parts }],
            config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.4, maxOutputTokens: 700 },
          });
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of stream) {
                  const text = chunk.text ?? "";
                  if (text) controller.enqueue(encoder.encode(text));
                }
                controller.close();
              } catch (error) {
                console.error("[v0] Grandou stream failed", error instanceof Error ? error.message : "unknown error");
                controller.error(error);
              }
            },
          });
          return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
        } catch (error) {
          console.error(
            "[v0] Grandou API failed",
            error instanceof Error ? error.message : "unknown error",
          );
          return Response.json(
            { ok: false, error: "تعذر الاتصال بالمساعد الآن. حاول مرة أخرى بعد قليل." },
            { status: 502 },
          );
        }
      },
    },
  },
});
