import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import villageBg from "@/assets/village-bg.webp.asset.json";
import { Character } from "@/components/game/Character";
import { ItemRing } from "@/components/game/ItemRing";
import { DialogueBox } from "@/components/game/DialogueBox";
import { QuestBoard } from "@/components/game/QuestBoard";
import { useAuth } from "@/hooks/useAuth";
import { useSteps } from "@/hooks/useSteps";
import { useWeather } from "@/hooks/useWeather";
import {
  loadDay, loadPlayer, randomItem, saveDay, savePlayer, todayStr, freshDay,
  loadMode, saveMode,
} from "@/lib/game/storage";
import type { DayState, Gender, Mode, PlayerState } from "@/lib/game/types";
import { ACCESSORIES } from "@/lib/game/accessories";
import { BOSSES } from "@/lib/game/bosses";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Home,
});

const MAX_EQUIPPED = 3;

function Home() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const weather = useWeather();
  const [mode, setMode] = useState<Mode>(() => loadMode());
  const [player, setPlayer] = useState<PlayerState>(() => loadPlayer());
  const [day, setDay] = useState<DayState>(() => loadDay(weather.boss, mode));
  const { steps, setSteps, permission, request } = useSteps(day.steps);
  const [devOpen, setDevOpen] = useState(false);
  const boss = BOSSES[day.weatherBoss];
  const completedCount = day.quests.filter((q) => q.completed).length;
  const allQuests = day.quests.length;
  const readyForBoss = completedCount >= 5;
  const travelerName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Traveler";
  const logoTapsRef = useRef<{ count: number; last: number }>({ count: 0, last: 0 });

  // Navigation Logic
  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  // Sync Logic
  useEffect(() => { saveDay({ ...day, steps }); }, [day, steps]);
  useEffect(() => { savePlayer(player); syncProfile(player, steps); }, [player, steps]);

  // UI State Logic
  const dialogueOpen = !player.dialogueSeen;
  const blocked = dialogueOpen || day.locked || day.bossDefeatedToday;

  function tapLogo() {
    const now = Date.now();
    const r = logoTapsRef.current;
    if (now - r.last > 800) r.count = 0;
    r.last = now;
    r.count += 1;
    if (r.count >= 5) {
      r.count = 0;
      setDevOpen(true);
      toast.message("🛠️ Developer Debug Menu เปิดแล้ว");
    }
  }

  async function syncProfile(p: PlayerState, totalSteps: number) {
    if (!user) return;
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Traveler",
        level: p.level,
        shields: p.shields,
        total_steps: totalSteps,
      });
    } catch { /* non-fatal */ }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--parchment)]">
        <p className="text-sm text-muted-foreground">กำลังเชื่อมต่อฐานข้อมูล...</p>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(244,235,225,0.4) 0%, rgba(244,235,225,0.8) 60%, var(--parchment-deep) 100%), url(${villageBg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
        fontFamily: "var(--font-thai)",
      }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--parchment)]/85 px-4 py-2 backdrop-blur">
        <button type="button" onClick={tapLogo} className="font-display text-lg font-extrabold tracking-wider">
          Nylazo
        </button>
        <div className="flex gap-2 text-xs">
          <Link to="/leaderboard" className="rounded-full border border-[var(--border)] bg-white px-3 py-1 font-semibold">🏆 อันดับ</Link>
          <button onClick={() => supabase.auth.signOut().then(() => nav({ to: "/auth" }))} className="rounded-full border border-[var(--border)] bg-white px-2 py-1">ออก</button>
        </div>
      </header>

      {/* Game Content Section */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-4">
        <h1 className="font-display text-3xl font-black tracking-wider">หมู่บ้าน Nylazo</h1>
        <div className="relative my-4 grid place-items-center" style={{ height: 340, width: 340 }}>
          <ItemRing items={day.items} size={320} />
          <Character gender={player.gender} onFlip={blocked ? undefined : () => setPlayer(p => ({ ...p, gender: p.gender === "boy" ? "girl" : "boy" }))} size={200} />
        </div>
        <QuestBoard day={day} boss={day.weatherBoss} onComplete={(id) => {/* completeQuest logic */}} onStart={(id) => {/* startQuest logic */}} onEnterBoss={() => {/* enterBoss logic */}} disabled={blocked} />
      </section>

      {dialogueOpen && <DialogueBox onDone={() => setPlayer(p => ({ ...p, dialogueSeen: true }))} />}
    </main>
  );
}