export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>تعذر تحميل الصفحة · Grand Auto Luxe</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      body { font: 15px/1.7 system-ui, -apple-system, sans-serif; background: #0d0d0d; color: #f5f5f5; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 32rem; width: 100%; text-align: center; padding: 2.5rem 1.5rem; border: 1px solid rgba(212,175,55,.35); border-radius: 1.5rem; background: linear-gradient(145deg,#171717,#0c0c0c); box-shadow: 0 20px 60px rgba(0,0,0,.45); }
      .brand { color: #d4af37; letter-spacing: .12em; font-weight: 700; margin-bottom: 2rem; }
      h1 { font-size: 1.75rem; margin: 0 0 .5rem; }
      p { color: #aaa; margin: 0 0 1.75rem; }
      .actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: .7rem 1.25rem; border-radius: .7rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid rgba(212,175,55,.55); }
      .primary { background: #d4af37; color: #111; }
      .secondary { background: transparent; color: #f5f5f5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="brand">GRAND AUTO LUXE</div>
      <h1>حدث خطأ مؤقت</h1>
      <p>تعذر تحميل الصفحة. حاول مرة أخرى أو ارجع إلى الصفحة الرئيسية.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">إعادة المحاولة</button>
        <a class="secondary" href="/">الرئيسية</a>
      </div>
    </div>
  </body>
</html>`;
}
