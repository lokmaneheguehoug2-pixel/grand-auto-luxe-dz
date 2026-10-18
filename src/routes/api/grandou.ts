import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `أنت Grandou، مساعد ذكي متخصص في السيارات داخل الجزائر. أجب بالعربية وباختصار مفيد. ساعد المستخدم في اختيار السيارات، مقارنة الأسعار، قطع الغيار، كتابة الإعلانات والتنقل داخل المنصة. لا تجب عن مواضيع خارج السيارات والمنصة.`;

export const Route = createFileRoute("/api/grandou")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null) as { message?: unknown } | null;
          const message = typeof body?.message === "string" ? body.message.trim() : "";
          if (!message) return Response.json({ ok: false, error: "الرسالة مطلوبة." }, { status: 400 });

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            console.error("[v0] Grandou API: GEMINI_API_KEY is missing");
            return Response.json({ ok: false, error: "المساعد غير متاح حاليًا. حاول لاحقًا." }, { status: 503 });
          }

          const ai = new GoogleGenAI({ apiKey });
          const result = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: message,
            config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.4, maxOutputTokens: 500 },
          });
          const text = result.text?.trim();
          if (!text) return Response.json({ ok: false, error: "لم تصل إجابة من المساعد." }, { status: 502 });
          return Response.json({ ok: true, text });
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
