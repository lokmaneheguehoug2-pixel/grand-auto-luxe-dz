import { useEffect, useState } from "react";

export function Countdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(endsAt).getTime() - now;
  if (diff <= 0) return <span className={`text-premium-red font-semibold ${className}`}>Bidding Closed</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className={`tabular-nums font-mono tracking-wider ${className}`}>
      {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </span>
  );
}
