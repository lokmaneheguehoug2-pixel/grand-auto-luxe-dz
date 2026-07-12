import { useEffect, useState } from "react";
import { Instagram, Facebook, Mail, MessageCircle, Phone, Music2, Lightbulb, Send } from "lucide-react";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off, push, set } from "firebase/database";
import { fetchPlatformSettings } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface SiteSettings {
  whatsapp_number: string;
  support_phone: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  baridi_mob_number: string;
  appointment_email: string;
  gmail_address: string;
}

const EMPTY_SETTINGS: SiteSettings = {
  whatsapp_number: "",
  support_phone: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  baridi_mob_number: "",
  appointment_email: "",
  gmail_address: "",
};

export function CustomerServiceFooter() {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";

  useEffect(() => {
    fetchPlatformSettings()
      .then((supaData) => {
        if (supaData) setSettings((prev) => ({ ...prev, ...supaData }));
      })
      .catch(() => {});

    if (!realtimeDb) return;
    const settingsRef = ref(realtimeDb, "site_settings");
    const handle = (snapshot: { val: () => Record<string, string> | null }) => {
      const data = snapshot.val() || {};
      if (Object.keys(data).length > 0) {
        setSettings({
          whatsapp_number: data.whatsapp_number || "",
          support_phone: data.support_phone || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          tiktok_url: data.tiktok_url || "",
          baridi_mob_number: data.baridi_mob_number || "",
          appointment_email: data.appointment_email || "",
          gmail_address: data.gmail_address || "",
        });
      }
    };
    onValue(settingsRef, handle);
    return () => off(settingsRef);
  }, []);

  const whatsappLink = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : "#";

  return (
    <footer className="border-t border-border/60 bg-charcoal/40 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/my-logo.png.PNG"
                alt="GRAND Auto Luxe"
                className="h-11 w-11 shrink-0 rounded-lg object-contain"
              />
              <div>
                <div className="font-display text-lg leading-none tracking-wide">
                  <span className="gold-shine font-bold">GRAND</span><span className="gold-text">A</span> <span className="gold-text">Auto Luxe</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Algeria · Premium</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium Algerian vehicle marketplace with live auctions, verified sellers, and trusted transactions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <button onClick={() => setFeedbackOpen(true)} className="text-muted-foreground hover:text-gold transition-colors text-left flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> اقتراحات · Suggest Improvements
              </button>
              <a href="/plans" className="text-muted-foreground hover:text-gold transition-colors">Subscription Plans</a>
              <a href="/auth" className="text-muted-foreground hover:text-gold transition-colors">Sign In / Register</a>
              <a href="/reels" className="text-muted-foreground hover:text-gold transition-colors">Reels</a>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Customer Service</h3>
            <div className="flex flex-wrap gap-3">
              {settings.whatsapp_number && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-green-600/10 hover:bg-green-600/20 flex items-center justify-center transition-colors group" title="WhatsApp">
                  <MessageCircle className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-pink-600/10 hover:bg-pink-600/20 flex items-center justify-center transition-colors group" title="Instagram">
                  <Instagram className="h-5 w-5 text-pink-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-blue-600/10 hover:bg-blue-600/20 flex items-center justify-center transition-colors group" title="Facebook">
                  <Facebook className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-gray-600/10 hover:bg-gray-600/20 flex items-center justify-center transition-colors group" title="TikTok">
                  <Music2 className="h-5 w-5 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.gmail_address && (
                <a href={`mailto:${settings.gmail_address}`}
                  className="h-10 w-10 rounded-full bg-red-600/10 hover:bg-red-600/20 flex items-center justify-center transition-colors group" title="Email">
                  <Mail className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>
            <div className="space-y-1.5">
              {settings.support_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-gold/70" />
                  <a href={`tel:${settings.support_phone}`} className="hover:text-gold transition-colors">{settings.support_phone}</a>
                </div>
              )}
              {settings.whatsapp_number && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-green-600/70" />
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">{settings.whatsapp_number}</a>
                </div>
              )}
              {settings.gmail_address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-red-600/70" />
                  <a href={`mailto:${settings.gmail_address}`} className="hover:text-red-600 transition-colors">{settings.gmail_address}</a>
                </div>
              )}
              {settings.baridi_mob_number && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-xs font-medium text-gold/70">CCP:</span>
                  <span>{settings.baridi_mob_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <span className="gold-text font-semibold">GRAND Auto Luxe</span> · Made in Algeria · {new Date().getFullYear()}
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-md bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="gold-text flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> اقتراحات · Suggest Improvements
            </DialogTitle>
          </DialogHeader>
          {!user ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Please sign in to submit feedback.</p>
              <Button variant="gold" size="sm" asChild><a href="/auth">Sign In</a></Button>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-charcoal px-3 text-sm"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ui">UI/UX Improvement</option>
                <option value="other">Other</option>
              </select>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts on how we can improve..."
                className="bg-charcoal min-h-[100px]"
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground">{feedbackText.length}/500</p>
              <Button
                variant="gold"
                className="w-full"
                disabled={submittingFeedback || !feedbackText.trim()}
                onClick={async () => {
                  setSubmittingFeedback(true);
                  try {
                    const fbRef = push(ref(realtimeDb, "feedback"));
                    await set(fbRef, {
                      id: fbRef.key,
                      userId: user.id,
                      userPhone: user.phone,
                      category: feedbackCategory,
                      message: feedbackText.trim(),
                      status: "pending",
                      createdAt: new Date().toISOString(),
                    });
                    toast.success("Thank you! Your feedback has been submitted.");
                    setFeedbackText("");
                    setFeedbackOpen(false);
                  } catch (err) {
                    toast.error("Failed to submit feedback");
                  } finally {
                    setSubmittingFeedback(false);
                  }
                }}
              >
                {submittingFeedback ? "Submitting..." : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Submit Feedback
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
