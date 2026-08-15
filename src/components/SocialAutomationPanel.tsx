import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader as Loader2, Send, RefreshCw, CircleCheck as CheckCircle2, Circle as XCircle, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";

type PublishSettings = {
  id: string;
  auto_publish_enabled: boolean;
  publish_feed_posts: boolean;
  publish_reels: boolean;
  default_language: "darija" | "french" | "arabic";
  updated_at: string;
};

type PublishLog = {
  id: string;
  vehicle_id: string;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_price: number | null;
  vehicle_wilaya: string | null;
  format_type: string;
  caption: string | null;
  hashtags: string[] | null;
  car_link: string | null;
  promo_code: string | null;
  image_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  published_at: string | null;
};

export function SocialAutomationPanel() {
  const [settings, setSettings] = useState<PublishSettings | null>(null);
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");

  const loadSettings = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    const { data, error } = await client
      .from("social_publish_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      toast.error("Failed to load automation settings");
      return;
    }
    setSettings(data as PublishSettings | null);
  }, []);

  const loadLogs = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    let query = client
      .from("social_publish_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (logFilter !== "all") {
      query = query.eq("status", logFilter);
    }
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load publish log");
      return;
    }
    setLogs((data as PublishLog[]) || []);
  }, [logFilter]);

  useEffect(() => {
    (async () => {
      await Promise.all([loadSettings(), loadLogs()]);
      setLoading(false);
    })();
  }, [loadSettings, loadLogs]);

  const toggleSetting = async (key: keyof PublishSettings, value: boolean) => {
    if (!settings) return;
    const client = getSupabase();
    if (!client) return;
    setSaving(true);
    const { error } = await client
      .from("social_publish_settings")
      .update({ [key]: value })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update setting");
      return;
    }
    setSettings({ ...settings, [key]: value });
    toast.success("Setting updated");
  };

  const changeLanguage = async (lang: string) => {
    if (!settings) return;
    const client = getSupabase();
    if (!client) return;
    setSaving(true);
    const { error } = await client
      .from("social_publish_settings")
      .update({ default_language: lang })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update language");
      return;
    }
    setSettings({ ...settings, default_language: lang as PublishSettings["default_language"] });
    toast.success("Default language updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="premium-card border-gold/20">
        <CardHeader>
          <CardTitle className="gold-text flex items-center gap-2">
            <Send className="h-5 w-5" />
            Social Automation - Publish Only Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal/50 border border-gold/10">
            <div>
              <div className="font-medium">Auto-Publish</div>
              <div className="text-sm text-muted-foreground">
                Automatically generate and publish content when a listing is approved
              </div>
            </div>
            <Switch
              checked={settings?.auto_publish_enabled ?? false}
              onCheckedChange={(v) => toggleSetting("auto_publish_enabled", v)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal/50 border border-gold/10">
            <div>
              <div className="font-medium">Feed Posts</div>
              <div className="text-sm text-muted-foreground">Generate square/landscape feed post payloads</div>
            </div>
            <Switch
              checked={settings?.publish_feed_posts ?? false}
              onCheckedChange={(v) => toggleSetting("publish_feed_posts", v)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal/50 border border-gold/10">
            <div>
              <div className="font-medium">Reels & Stories</div>
              <div className="text-sm text-muted-foreground">Generate vertical 9:16 reel/story payloads</div>
            </div>
            <Switch
              checked={settings?.publish_reels ?? false}
              onCheckedChange={(v) => toggleSetting("publish_reels", v)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal/50 border border-gold/10">
            <div>
              <div className="font-medium">Default Caption Language</div>
              <div className="text-sm text-muted-foreground">Language for generated captions</div>
            </div>
            <Select
              value={settings?.default_language ?? "darija"}
              onValueChange={(v) => changeLanguage(v)}
            >
              <SelectTrigger className="w-40 bg-charcoal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="darija">Algerian Darija</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Publish-only mode: no auto-replies, DMs, or comment handling.
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card border-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gold-text flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Publish Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={logFilter} onValueChange={setLogFilter}>
                <SelectTrigger className="w-32 bg-charcoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No publish records yet. Approved listings will appear here.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg bg-charcoal/50 border border-gold/10 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {log.vehicle_brand} {log.vehicle_model}
                        </span>
                        {log.vehicle_year && (
                          <Badge variant="outline" className="text-xs">{log.vehicle_year}</Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            log.format_type === "feed"
                              ? "text-xs border-blue-400/40 text-blue-400"
                              : "text-xs border-purple-400/40 text-purple-400"
                          }
                        >
                          {log.format_type === "feed" ? "Feed" : "Reel/Story"}
                        </Badge>
                        <StatusBadge status={log.status} />
                      </div>
                      {log.vehicle_wilaya && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {log.vehicle_wilaya}
                          {log.vehicle_price != null && ` · 💰 ${log.vehicle_price.toLocaleString("fr-DZ")} DZD`}
                        </div>
                      )}
                      {log.caption && (
                        <div className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">
                          {log.caption}
                        </div>
                      )}
                      {log.hashtags && log.hashtags.length > 0 && (
                        <div className="text-xs text-gold/70 mt-1 line-clamp-1">
                          {log.hashtags.join(" ")}
                        </div>
                      )}
                      {log.car_link && (
                        <a
                          href={log.car_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline mt-1 inline-flex items-center gap-1"
                        >
                          {log.car_link} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {log.error_message && (
                        <div className="text-xs text-red-400 mt-1">{log.error_message}</div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {log.published_at
                          ? `Published ${new Date(log.published_at).toLocaleString()}`
                          : `Created ${new Date(log.created_at).toLocaleString()}`}
                      </div>
                    </div>
                    {log.image_url && (
                      <img
                        src={log.image_url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover border border-gold/20 shrink-0"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge variant="outline" className="text-xs border-green-400/40 text-green-400">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Published
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="outline" className="text-xs border-red-400/40 text-red-400">
        <XCircle className="h-3 w-3 mr-1" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs border-yellow-400/40 text-yellow-400">
      <Clock className="h-3 w-3 mr-1" /> Pending
    </Badge>
  );
}
