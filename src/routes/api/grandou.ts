import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `أنت Grandou، مساعد ذكي متخصص في السيارات داخل الجزائر. أجب بالعربية وباختصار مفيد. ساعد المستخدم في اختيار السيارات، مقارنة الأسعار، قطع الغيار، كتابة الإعلانات والتنقل داخل المنصة. لا تجب عن مواضيع خارج السيارات والمنصة.`;

export const Route = createFileRoute("/api/grandou")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const maxImageBytes = 8 * 1024 * 1024;
          const requestLength = Number(request.headers.get("content-length") || 0);
          if (requestLength > maxImageBytes * 1.5) {
            return Response.json({ ok: false, error: "الطلب أكبر من الحد المسموح." }, { status: 413 });
          }
          const body = await request.json().catch(() => null) as {
            message?: unknown;
            history?: Array<{ role?: unknown; text?: unknown }>;
            image?: { mimeType?: unknown; data?: unknown; url?: unknown };
          } | null;
          const message = typeof body?.message === "string" ? body.message.trim() : "";
          if (message.length > 4000) return Response.json({ ok: false, error: "الرسالة أطول من الحد المسموح." }, { status: 413 });
          if (!message && !body?.image?.data && !body?.image?.url) return Response.json({ ok: false, error: "الرسالة أو الصورة مطلوبة." }, { status: 400 });

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return Response.json({ ok: false, error: "المساعد غير متاح حاليًا. تحقق من إعدادات الذكاء الاصطناعي." }, { status: 503 });
          }

          const ai = new GoogleGenAI({ apiKey });
          const history = Array.isArray(body?.history)
            ? body.history
                .filter((item) => (item?.role === "user" || item?.role === "model") && typeof item.text === "string")
                .slice(-12)
                .map((item) => ({ role: item.role as "user" | "model", parts: [{ text: (item.text as string).slice(0, 2000) }] }))
            : [];
          const parts: Array<Record<string, unknown>> = [];
          if (message) parts.push({ text: message });
          if (typeof body?.image?.url === "string") {
            let imageUrl: URL;
            try {
              imageUrl = new URL(body.image.url);
            } catch {
              return Response.json({ ok: false, error: "رابط الصورة غير صالح." }, { status: 400 });
            }
            if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "res.cloudinary.com" || imageUrl.username || imageUrl.password) {
              return Response.json({ ok: false, error: "مصدر الصورة غير مسموح." }, { status: 400 });
            }
            const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(12_000), redirect: "error" });
            if (!imageResponse.ok) throw new Error("Cloudinary image unavailable");
            const mimeType = (imageResponse.headers.get("content-type") || "image/jpeg").split(";")[0].trim().toLowerCase();
            const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
            if (!allowedImageTypes.has(mimeType)) return Response.json({ ok: false, error: "نوع الصورة غير مدعوم." }, { status: 415 });
            if (Number(imageResponse.headers.get("content-length") || 0) > maxImageBytes) {
              return Response.json({ ok: false, error: "حجم الصورة أكبر من الحد المسموح." }, { status: 413 });
            }
            const reader = imageResponse.body?.getReader();
            if (!reader) throw new Error("Image response body unavailable");
            const chunks: Uint8Array[] = [];
            let totalBytes = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              totalBytes += value.byteLength;
              if (totalBytes > maxImageBytes) {
                await reader.cancel();
                return Response.json({ ok: false, error: "حجم الصورة أكبر من الحد المسموح." }, { status: 413 });
              }
              chunks.push(value);
            }
            const data = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("base64");
            parts.push({ inlineData: { mimeType, data } });
          } else if (body?.image?.data && typeof body.image.data === "string" && typeof body.image.mimeType === "string") {
            const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
            if (!allowedImageTypes.has(body.image.mimeType.toLowerCase())) {
              return Response.json({ ok: false, error: "نوع الصورة غير مدعوم." }, { status: 415 });
            }
            if (body.image.data.length > Math.ceil(maxImageBytes * 4 / 3) + 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.image.data)) {
              return Response.json({ ok: false, error: "بيانات الصورة غير صالحة أو كبيرة جدًا." }, { status: 413 });
            }
            const imageBytes = Buffer.from(body.image.data, "base64");
            if (!imageBytes.byteLength || imageBytes.byteLength > maxImageBytes) {
              return Response.json({ ok: false, error: "حجم الصورة أكبر من الحد المسموح." }, { status: 413 });
            }
            parts.push({ inlineData: { mimeType: body.image.mimeType.toLowerCase(), data: imageBytes.toString("base64") } });
          }
          const generationRequest = {
            model: "gemini-3.5-flash",
            contents: [...history, { role: "user" as const, parts }],
            config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.4, maxOutputTokens: 700 },
          };
          const retryable = (error: unknown) => {
            const candidate = error as { status?: number; code?: number; cause?: { status?: number } };
            return [408, 429, 500, 502, 503, 504].includes(Number(candidate?.status ?? candidate?.code ?? candidate?.cause?.status));
          };
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              for (let attempt = 0; attempt < 3; attempt += 1) {
                let sentAnyText = false;
                try {
                  const stream = await ai.models.generateContentStream(generationRequest);
                  for await (const chunk of stream) {
                    const text = chunk.text ?? "";
                    if (text) {
                      sentAnyText = true;
                      controller.enqueue(encoder.encode(text));
                    }
                  }
                  controller.close();
                  return;
                } catch (error) {
                  if (attempt < 2 && !sentAnyText && retryable(error)) {
                    await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
                    continue;
                  }
                  console.error("[v0] Grandou stream failed", error instanceof Error ? error.message : "unknown error");
                  controller.enqueue(encoder.encode("تعذر إكمال الرد. أعد المحاولة بعد لحظات."));
                  controller.close();
                  return;
                }
              }
              controller.close();
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
