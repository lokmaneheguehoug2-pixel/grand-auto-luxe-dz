import { useEffect, useState } from "react";
import { Instagram, Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  gmail_address: string;
}

export function CustomerServiceFooter() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: "",
    instagram_url: "",
    facebook_url: "",
    gmail_address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value");

        if (!error && data) {
          const settingsMap: Record<string, string> = {};
          data.forEach((item) => {
            settingsMap[item.setting_key] = item.setting_value ?? "";
          });
          setSettings({
            whatsapp_number: settingsMap.whatsapp_number || "",
            instagram_url: settingsMap.instagram_url || "",
            facebook_url: settingsMap.facebook_url || "",
            gmail_address: settingsMap.gmail_address || "",
          });
        }
      } catch (err) {
        console.error("Failed to load site settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const whatsappLink = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : "#";

  return (
    <footer className="border-t border-border/60 bg-charcoal/40 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gold-gradient grid place-items-center">
                <span className="font-display text-sm font-bold text-gold-foreground">G</span>
              </div>
              <span className="font-display text-lg gold-text">GRAND Auto Luxe</span>
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
            </nav>
          </div>

          {/* Customer Service */}
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
                  title="Gmail"
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
