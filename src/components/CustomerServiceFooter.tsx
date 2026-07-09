import { useEffect, useState } from "react";
import { Instagram, Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";

interface SiteSettings {
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  gmail_address: string;
  appointment_email: string;
}

export function CustomerServiceFooter() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    gmail_address: "",
    appointment_email: "",
  });

  useEffect(() => {
    const settingsRef = ref(realtimeDb, "site_settings");
    const handle = (snapshot: { val: () => Record<string, string> | null }) => {
      const data = snapshot.val() || {};
      setSettings({
        whatsapp_number: data.whatsapp_number || "",
        instagram_url: data.instagram_url || "",
        facebook_url: data.facebook_url || "",
        tiktok_url: data.tiktok_url || "",
        gmail_address: data.gmail_address || "",
        appointment_email: data.appointment_email || "",
      });
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
          {/* Brand Section — full logo matching header */}
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

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="/brands" className="text-muted-foreground hover:text-gold transition-colors">
                Browse Brands
              </a>
              <a href="/plans" className="text-muted-foreground hover:text-gold transition-colors">
                Subscription Plans
              </a>
              <a href="/auth" className="text-muted-foreground hover:text-gold transition-colors">
                Sign In / Register
              </a>
              <a href="/reels" className="text-muted-foreground hover:text-gold transition-colors">
                Reels
              </a>
            </nav>
          </div>

          {/* Customer Service & Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Customer Service</h3>
            <div className="flex gap-3">
              {settings.whatsapp_number && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-green-600/10 hover:bg-green-600/20 flex items-center justify-center transition-colors group"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-pink-600/10 hover:bg-pink-600/20 flex items-center justify-center transition-colors group"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5 text-pink-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-blue-600/10 hover:bg-blue-600/20 flex items-center justify-center transition-colors group"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.gmail_address && (
                <a
                  href={`mailto:${settings.gmail_address}`}
                  className="h-10 w-10 rounded-full bg-red-600/10 hover:bg-red-600/20 flex items-center justify-center transition-colors group"
                  title="Email"
                >
                  <Mail className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>
            {settings.whatsapp_number && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{settings.whatsapp_number}</span>
              </div>
            )}
            {settings.gmail_address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{settings.gmail_address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <span className="gold-text font-semibold">GRAND Auto Luxe</span> · Made in Algeria · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
