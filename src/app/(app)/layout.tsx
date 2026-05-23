"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Check,
  Menu,
  Clock,
  Activity,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  FileText,
  Users,
  Map as MapIcon,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Zap
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Engine State
  const [isPlayingNoise, setIsPlayingNoise] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // User details local states (loaded or default)
  const [workspaceName, setWorkspaceName] = useState<string>("North Star");
  const [userName, setUserName] = useState<string>("Productivity Seeker");
  const [noiseVolume, setNoiseVolume] = useState<number>(40);

  // Load from localStorage or configurations
  useEffect(() => {
    // Soft settings sync
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("spacenos_user_name");
      const savedWorkspace = localStorage.getItem("spacenos_workspace_name");
      const savedVol = localStorage.getItem("spacenos_noise_vol");
      if (savedUser) setUserName(savedUser);
      if (savedWorkspace) setWorkspaceName(savedWorkspace);
      if (savedVol) setNoiseVolume(Number(savedVol));
    }
  }, [pathname]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sound generator toggle (Web Audio API)
  const toggleFocusSound = () => {
    if (isPlayingNoise) {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
        sourceNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().then(() => {
          audioCtxRef.current = null;
        });
      }
      setIsPlayingNoise(false);
      showToast("Atmospheric brown noise paused. Return anytime.");
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 320;

        const gainNode = ctx.createGain();
        gainNode.gain.value = (noiseVolume / 100) * 0.4;

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(0);
        sourceNodeRef.current = source;
        setIsPlayingNoise(true);
        showToast("Cozy Brownian focus frequency active. Enjoy your sensory sanctuary!");
      } catch (err) {
        console.error("Web Audio not supported:", err);
        showToast("Audio synthesis is restricted in this browser viewport.");
      }
    }
  };

  const navItems = [
    { id: "focus", label: "Focus", href: "/focus", icon: <Target className="w-4 h-4" /> },
    { id: "capture", label: "Capture", href: "/capture", icon: <Zap className="w-4 h-4" /> },
    { id: "planner", label: "Planner", href: "/planner", icon: <Calendar className="w-4 h-4" /> },
    { id: "notes", label: "Notes", href: "/notes", icon: <FileText className="w-4 h-4" /> },
    { id: "team", label: "Team", href: "/team", icon: <Users className="w-4 h-4" /> },
    { id: "map", label: "Map", href: "/map", icon: <MapIcon className="w-4 h-4" /> },
    { id: "review", label: "Review", href: "/review", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "settings", label: "Settings", href: "/settings", icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  const getActiveTab = () => {
    const matched = navItems.find((item) => pathname.startsWith(item.href));
    return matched ? matched.id : "planner";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#1F1F1F] font-sans antialiased flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Toast Notification alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-4 sm:right-8 z-50 max-w-sm bg-primary text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-secondary-container shrink-0 animate-spin" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-auto text-white/85 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar */}
      <aside className="w-full md:w-64 border-r border-[rgba(0,0,0,0.06)] bg-[#F8F5F1] sticky top-0 h-auto md:h-screen flex flex-col justify-between hidden md:flex shrink-0 z-30">
        <div className="flex flex-col pt-6 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 mb-8">
            <Link href="/">
              <img alt="SPACENOS Logo" className="h-6 w-auto block select-none cursor-pointer" src="/image.png" />
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? "bg-[#FCEBE6] text-[#E14C2A] border-l-2 border-[#E14C2A]"
                      : "text-[#1F1F1F] hover:bg-slate-200/50 hover:text-black"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom user card */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.06)] bg-surface-container/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1F1F1F] truncate leading-none">{userName}</p>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5 block">
                Workspace: {workspaceName}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              router.push("/");
              showToast("Logged out of secure workspace.");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[rgba(0,0,0,0.06)] hover:bg-[#FCEBE6]/40 text-xs font-bold transition-all text-[#6B6B6B] hover:text-[#E14C2A]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 w-full z-20 bg-[#F8F5F1]/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] px-4 py-3 flex justify-between items-center md:hidden shrink-0">
        <Link href="/">
          <img alt="SPACENOS Logo" className="h-5 w-auto select-none cursor-pointer" src="/image.png" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 rounded-lg border border-[rgba(0,0,0,0.06)] hover:bg-slate-100"
        >
          <Menu className="w-4 h-4 text-primary" />
        </button>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8F5F1] border-t border-[rgba(0,0,0,0.06)] flex justify-around items-center md:hidden h-16 px-2">
        <Link
          href="/focus"
          className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
            activeTab === "focus" ? "text-primary font-bold" : "text-[#6B6B6B]"
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Focus</span>
        </Link>

        <Link
          href="/planner"
          className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
            activeTab === "planner" ? "text-primary font-bold" : "text-[#6B6B6B]"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Planner</span>
        </Link>

        {/* Mobile floating capture shortcut button */}
        <div className="relative -top-4 px-2">
          <Link
            href="/capture"
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Zap className="w-5 h-5" />
          </Link>
        </div>

        <Link
          href="/notes"
          className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
            activeTab === "notes" ? "text-primary font-bold" : "text-[#6B6B6B]"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Notes</span>
        </Link>

        <Link
          href="/review"
          className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
            activeTab === "review" ? "text-primary font-bold" : "text-[#6B6B6B]"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Review</span>
        </Link>
      </div>

      {/* Mobile Menu Slide-out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 bg-[#F8F5F1] h-full shadow-2xl flex flex-col justify-between p-6 z-10"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[rgba(0,0,0,0.06)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">All Spaces</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-[#6B6B6B] hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === item.id ? "bg-[#FCEBE6] text-[#E14C2A]" : "text-[#1F1F1F] hover:bg-slate-200/50"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-[rgba(0,0,0,0.06)] space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    PS
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1F1F1F] leading-none">{userName}</p>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5 block">
                      Workspace: {workspaceName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/");
                    showToast("Logged out of secure workspace.");
                  }}
                  className="w-full py-2 bg-slate-200/60 hover:bg-[#FCEBE6]/40 text-xs font-bold rounded-lg flex items-center justify-center gap-2 text-[#6B6B6B] hover:text-[#E14C2A] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content viewport */}
      <main className="flex-1 flex flex-col h-auto md:h-screen overflow-y-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Accessories Sound Synthesis Trigger Dock */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-2 bg-white/95 max-w-xs px-3 py-2 rounded-xl shadow-lg border border-on-surface/10 backdrop-blur-md">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 shrink-0 text-primary" /> Focus Audio:
        </span>
        <button
          onClick={toggleFocusSound}
          className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            isPlayingNoise
              ? "bg-primary text-white animate-pulse"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface"
          }`}
          title="Play Brownian White Noise"
        >
          {isPlayingNoise ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
