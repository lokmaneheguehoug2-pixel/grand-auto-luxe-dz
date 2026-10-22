import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Database, FileCheck2, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

const sections = [
  {
    icon: ShieldCheck,
    title: "1. نطاق المنصة وهويتها",
    body: "Grand Auto Luxe هي منصة رقمية جزائرية مستقلة للإعلانات المبوبة والاشتراكات في مجال السيارات. تربط المنصة بين المشترين والبائعين والمهنيين، وتوفر أدوات لعرض المركبات والتواصل واكتشاف العروض، دون أن تكون طرفًا في عقود البيع أو الشراء.",
  },
  {
    icon: AlertTriangle,
    title: "2. إخلاء المسؤولية عن الصفقات والمدفوعات",
    body: "تعمل Grand Auto Luxe حصريًا كمنصة إعلانية ووسيط تقني للتواصل. لا تتحمل المنصة أي مسؤولية قانونية أو مالية أو معنوية عن أي دفعات مسبقة أو عربون أو حجز أو تحويل مالي أو اتفاق مباشر يتم بين المستخدمين، سواء داخل المنصة أو خارجها. جميع الصفقات والمدفوعات تتم على مسؤولية الأطراف المعنية وحدهم، وعلى المستخدم التحقق من هوية الطرف الآخر والمركبة والوثائق قبل الدفع أو الالتزام.",
  },
  {
    icon: WalletCards,
    title: "3. الاشتراكات والفوترة",
    body: "الاشتراكات تمنح مزايا رقمية محددة بحسب الخطة المختارة، ولا تُعد ضمانًا لإتمام أي صفقة أو بيع مركبة. يتم تفعيل الاشتراك وفق إجراءات المنصة والتحقق من الدفع، وقد تتغير المزايا أو الأسعار مع نشر إشعار مناسب. رسوم الاشتراك لا تعني أن Grand Auto Luxe تضمن جودة الإعلان أو ملاءة أي مستخدم.",
  },
  {
    icon: Database,
    title: "4. تخزين البيانات والوسائط",
    body: "تتم إدارة البيانات النصية وملفات المستخدمين والملفات الشخصية ومعلومات الاشتراك وحالات التطبيق بشكل آمن عبر Firebase (Firestore وRealtime Database وخدمات Firebase ذات الصلة). تُرفع الصور والفيديوهات والـ Reels وتُخزن وتُعالج عبر Cloudinary فقط. لا تستخدم Grand Auto Luxe Supabase ولا تعتمد عليه في تخزين أو معالجة بيانات المنصة.",
  },
  {
    icon: LockKeyhole,
    title: "5. حماية البيانات وأمن الحساب",
    body: "نطبق ممارسات معقولة لحماية البيانات من الوصول غير المصرح به، ونستخدم صلاحيات الوصول المناسبة ونقلًا آمنًا للبيانات حيثما أمكن. يلتزم المستخدم بالحفاظ على سرية كلمة المرور، وعدم مشاركتها، وتسجيل الخروج من الأجهزة المشتركة، وإبلاغنا فورًا عند الاشتباه في استخدام الحساب. لا تطلب Grand Auto Luxe كلمة المرور عبر الرسائل أو الهاتف.",
  },
  {
    icon: FileCheck2,
    title: "6. حقوق المستخدم وإدارة الحساب",
    body: "يحق للمستخدم الاطلاع على بياناته المتاحة في الحساب وتحديثها وتصحيحها، وطلب إيقاف الحساب أو حذفه وفق المتطلبات القانونية والاحتياجات التشغيلية. قد نحتفظ بسجلات لازمة للأمن، ومنع الاحتيال، وتسوية النزاعات، والالتزامات القانونية. لا تنشر معلومات شخصية أو وثائق حساسة في إعلان عام أو في محادثة مع طرف غير موثوق.",
  },
];

function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      <section className="relative overflow-hidden border-b border-gold/15 bg-charcoal/60 px-4 pb-14 pt-16 sm:px-6">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold/80">
            <ArrowRight className="h-4 w-4" /> العودة إلى Grand Auto Luxe
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">Grand Auto Luxe · الجزائر</p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl">سياسة الخصوصية وإخلاء المسؤولية</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            توضح هذه الصفحة كيفية إدارة البيانات وحدود مسؤولية المنصة وحقوق المستخدمين عند استخدام سوق السيارات والإعلانات والاشتراكات.
          </p>
          <p className="mt-6 text-xs text-muted-foreground/70">آخر تحديث: 22 أكتوبر 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-10 sm:px-6 sm:py-14">
        {sections.map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-charcoal/35 p-5 shadow-xl shadow-black/10 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
            </div>
            <p className="text-sm leading-8 text-muted-foreground sm:text-base">{body}</p>
          </article>
        ))}

        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm leading-8 text-white/80 sm:p-7">
          <strong className="text-gold">تنبيه مهم:</strong> لا ترسل أي مبلغ أو وثيقة أصلية أو بيانات بنكية إلى مستخدم آخر قبل التحقق المستقل من هويته ومعلومات المركبة. استخدامك للمنصة يعني اطلاعك على هذه الشروط وقبولك لمسؤوليتك عن قراراتك وتعاملك المباشر.
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-right">
          <p className="text-xs leading-6 text-muted-foreground">للاقتراحات أو الاستفسارات، استخدم قنوات خدمة العملاء الموجودة أسفل الموقع.</p>
          <Link to="/plans" className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10">
            استكشف الاشتراكات <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
