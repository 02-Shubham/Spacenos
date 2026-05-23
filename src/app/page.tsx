"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  Target,
  Brain,
  Check,
  Mail,
  Phone,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Menu,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  ChevronRight,
  Plus,
  Trash2,
  Info
} from "lucide-react";

// Types for tasks
interface Task {
  text: string;
  category: string;
  priority: string;
  completed: boolean;
}

export default function LandingPage() {
  const router = useRouter();

  // Audio Engine Focus State
  const [isPlayingNoise, setIsPlayingNoise] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Today's Focus Interactive State
  const [focusTasks, setFocusTasks] = useState<Task[]>([
    { text: "Review project brief with design team", category: "Email", priority: "High", completed: true },
    { text: "Call client regarding updates on launch plan", category: "Call", priority: "Medium", completed: false },
    { text: "Write draft for the weekly product newsletter", category: "Focus", priority: "Focus", completed: false }
  ]);

  // Scratchpad interactive fields
  const [scratchpadText, setScratchpadText] = useState<string>(
    "email sarah about the thing...\noh and pay rent before friday!\nbuy groceries (eggs, milk)\ncall mom back to check up"
  );
  const [organizedTasks, setOrganizedTasks] = useState<Task[]>([
    { text: "Email Sarah re: Project X", category: "Email", priority: "Focus", completed: false },
    { text: "Rent payment (Due Friday)", category: "Rent", priority: "High", completed: false },
    { text: "Grocery run: Staples (eggs, milk)", category: "Grocery", priority: "Medium", completed: false },
    { text: "Call Mom", category: "Call", priority: "Medium", completed: false }
  ]);
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [organizeMode, setOrganizeMode] = useState<string>("default");

  // Bottom Workspace State (Sandbox app preview)
  const [userTasks, setUserTasks] = useState<string[]>(["", "", ""]);
  const [savedWorkspace, setSavedWorkspace] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [workspaceEmail, setWorkspaceEmail] = useState<string>("");

  // Loading/Notification toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial tasks from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem("spacenos_user_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setUserTasks(parsed);
          setSavedWorkspace(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Show dynamic toast helper
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
        gainNode.gain.value = 0.16;

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(0);
        sourceNodeRef.current = source;
        setIsPlayingNoise(true);
        showToast("Cozy Brownian focus frequency active. Enjoy your sensory sanctuary!");
      } catch (err) {
        console.error("Web Audio not supported:", err);
        showToast("Audio synthesis is restricted inside this viewport or browser.");
      }
    }
  };

  // Tasks progress calculated
  const completedCount = focusTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / focusTasks.length) * 100);

  // Today's focus toggle checkbox
  const toggleFocusTask = (index: number) => {
    const updated = [...focusTasks];
    updated[index].completed = !updated[index].completed;
    setFocusTasks(updated);
  };

  // Trigger Backend Organize API call with Gemini
  const triggerScratchpadOrganize = async () => {
    if (!scratchpadText.trim()) {
      showToast("Please input some messy thoughts in the scratchpad first.");
      return;
    }
    setIsOrganizing(true);
    try {
      const response = await fetch("/api/organize-scratchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scratchpadText })
      });
      const data = await response.json();
      if (data.tasks) {
        setOrganizedTasks(data.tasks);
        setOrganizeMode(data.mode);
        showToast(
          data.mode === "gemini"
            ? "Gemini AI extracted custom micro-tasks directly with cognitive patterns!"
            : "Parsed structure beautifully using safe heuristic logic."
        );
      }
    } catch (e: any) {
      showToast("Fallback parser active. Kept experience fully responsive.");
    } finally {
      setIsOrganizing(false);
    }
  };

  // Save targets and go to app
  const saveUserSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTasks = userTasks.map(t => t.trim()).filter(Boolean);
    if (cleanTasks.length === 0) {
      showToast("Please list at least one goal for your Spacenos card.");
      return;
    }
    localStorage.setItem("spacenos_user_tasks", JSON.stringify(userTasks));
    setSavedWorkspace(true);
    setIsModalOpen(false);
    router.push("/planner");
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("mail") || cat.includes("email") || cat.includes("sarah")) {
      return <Mail className="w-4 h-4 text-primary" />;
    }
    if (cat.includes("call") || cat.includes("phone") || cat.includes("mom")) {
      return <Phone className="w-4 h-4 text-primary" />;
    }
    if (cat.includes("grocery") || cat.includes("groceries") || cat.includes("buy") || cat.includes("staples")) {
      return <ShoppingCart className="w-4 h-4 text-primary" />;
    }
    if (cat.includes("rent") || cat.includes("pay") || cat.includes("bill")) {
      return <CreditCard className="w-4 h-4 text-primary" />;
    }
    return <Sparkles className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="dot-grid min-h-screen text-[#1F1F1F] antialiased selection:bg-secondary-container relative pb-16">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm bg-primary text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-secondary-container shrink-0 animate-spin" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-auto text-white/85 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Focus Audio Dock */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-white/95 max-w-xs px-3 py-2 rounded-xl shadow-lg border border-on-surface/10 backdrop-blur-md">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 shrink-0 text-primary" /> Focus Audio:
        </span>
        <button
          onClick={toggleFocusSound}
          className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            isPlayingNoise ? "bg-primary text-white animate-pulse" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
          }`}
          title="Play Brownian White Noise"
        >
          {isPlayingNoise ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Header / Top NavBar */}
      <nav className="sticky top-0 w-full z-30 bg-white/90 backdrop-blur-md border-b border-on-surface/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-2">
            <img
              alt="SPACENOS Logo"
              className="h-7 w-auto block select-none"
              src="/image.png"
            />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-primary font-bold border-b-2 border-primary pb-1 font-sans text-xs tracking-wide transition-colors">
              Features
            </a>
            <a href="#built-for-adhd" className="text-[#1F1F1F] font-semibold font-sans text-xs tracking-wide hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#scratchpad" className="text-[#1F1F1F] font-semibold font-sans text-xs tracking-wide hover:text-primary transition-colors">
              ADHD-Friendly
            </a>
            <a href="#pricing" className="text-[#1F1F1F] font-semibold font-sans text-xs tracking-wide hover:text-primary transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/planner")}
              className="text-[#1F1F1F] text-xs font-semibold hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/planner")}
              className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:brightness-90 transition-all shadow-sm"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-8 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Hero Section */}
        <section className="text-center mb-16 pt-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-on-surface tracking-tight leading-tight mb-6">
              Stop managing tasks. <br /> Start <span className="text-primary">doing them.</span>
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
              You open your task app. You see <span className="text-primary">47 things</span>. You close it. Nothing gets done. <span className="text-primary">There's a better way.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => router.push("/planner")}
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary-container px-8 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Start With Just 3 Things
              </button>
              <a
                href="#built-for-adhd"
                className="w-full sm:w-auto text-center border-2 border-outline/20 text-on-surface hover:text-primary hover:border-primary/45 px-8 py-3 rounded-xl text-sm font-semibold transition-all bg-white/50"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
        </section>

        {/* Hero Interactive Task Mockup Preview */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-2xl high-contrast-border p-6 sm:p-10 shadow-xl relative overflow-hidden">
            
            {/* Top Row: Header & Animating SVG progress ring */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-on-surface/5">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Today's Focus Sandbox
                </span>
                <h2 className="font-display text-xl sm:text-2xl text-on-surface font-medium">
                  Win the morning.
                </h2>
              </div>

              {/* Progress Circle Ring */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-surface-container-low rounded-full">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container" cx="32" cy="32" fill="transparent" r="26" stroke="currentColor" strokeWidth="4" />
                  <motion.circle
                    className="text-primary"
                    cx="32"
                    cy="32"
                    fill="transparent"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="163.3"
                    initial={{ strokeDashoffset: 163.3 }}
                    animate={{ strokeDashoffset: 163.3 - (163.3 * (progressPercent || 0)) / 100 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-surface">
                  {progressPercent}%
                </div>
              </div>
            </div>

            {/* Sandbox Notice */}
            <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[11px] text-[#6B6B6B] font-medium">
                Try toggling checkout states. ADHD workflows demand a dynamic progress release to fire dopamine cleanly!
              </p>
            </div>

            {/* Editable Tasks grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {focusTasks.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleFocusTask(idx)}
                  className={`border-2 p-5 rounded-xl transition-all duration-300 cursor-pointer group select-none ${
                    task.completed
                      ? "bg-surface-container-low border-on-surface/5 hover:border-primary/20 opacity-75"
                      : "bg-white border-primary/25 hover:border-primary shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                        idx === 0
                          ? "bg-primary-fixed text-on-primary-fixed border-primary/10"
                          : idx === 1
                          ? "bg-secondary-container text-on-secondary-container border-on-secondary-container/10"
                          : "bg-tertiary-fixed text-on-tertiary-fixed border-on-tertiary-fixed/10"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button className="text-primary transition-colors focus:outline-none">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-outline-variant hover:border-primary" />
                      )}
                    </button>
                  </div>
                  
                  <p
                    className={`text-xs leading-relaxed font-sans transition-all inline-block ${
                      task.completed ? "text-[#6B6B6B] line-through decoration-primary/45" : "text-on-surface font-semibold"
                    }`}
                  >
                    {task.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="features" className="max-w-7xl mx-auto py-12 bg-surface-container/30 rounded-[2rem] border border-on-surface/5 p-6 sm:p-12 mb-20 shadow-sm">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 inline-block mb-3">
              Neurodivergence First
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-on-surface leading-tight font-semibold">
              Built for ADHD brains — not against them.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: No Guilt */}
            <div className="p-6 sm:p-8 bg-white rounded-xl high-contrast-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-3 text-on-surface font-semibold">
                No Guilt Strategy
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                Systems that forgive you when you skip a day. No harsh streaks to break, just a fresh start every time you return. Your energy is protected.
              </p>
            </div>

            {/* Card 2: Focus First */}
            <div className="p-6 sm:p-8 bg-white rounded-xl high-contrast-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-3 text-on-surface font-semibold">
                Prioritize Focus First
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                Designed to help you restrict tasks. Pick only 3 key things and ignore the endless background noise. We hide the overflow so you locate the flow state.
              </p>
            </div>

            {/* Card 3: External Brain */}
            <div className="p-6 sm:p-8 bg-white rounded-xl high-contrast-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-3 text-on-surface font-semibold">
                The Externalized Brain
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                Capture ideas, messages, or chores instantly. Your working memory has strict limits—save it purely for execution, not storage fatigue.
              </p>
            </div>

          </div>
        </section>

        {/* Split Section: "Win the day with just 3 things." */}
        <section id="built-for-adhd" className="max-w-6xl mx-auto py-12 mb-20 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl text-on-surface leading-tight font-semibold">
                Win the day with just 3 things.
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-medium leading-relaxed">
                The biggest hurdle for neurodivergent productivity is the 'Infinite List'. By limiting your day to exactly three actionable tasks, SPACENOS enforces a gentle boundary that protects your remaining daily executive battery.
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm">JS</div>
                  <div className="w-8 h-8 rounded-full bg-[#eae0b5] text-[#6a6341] border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm">MK</div>
                  <div className="w-8 h-8 rounded-full bg-[#e5e2de] text-on-surface-variant border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm">+18k</div>
                </div>
                <span className="text-xs text-on-surface font-semibold">
                  Finding calm momentum together worldwide.
                </span>
              </div>
            </div>

            {/* List illustration representing strict limit */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white high-contrast-border p-5 rounded-xl flex items-center gap-4 shadow-sm opacity-60">
                <div className="w-5 h-5 rounded-md border border-primary/20 bg-primary/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-on-surface/50 line-through">Draft sales proposal board for Monday</span>
              </div>

              <div className="bg-white high-contrast-border p-5 rounded-xl flex items-center gap-4 shadow-sm opacity-60">
                <div className="w-5 h-5 rounded-md border border-primary/20 bg-primary/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-on-surface/50 line-through">Quick HIIT home workout for raw dopamine reset</span>
              </div>

              <div className="bg-white border-2 border-primary/70 p-6 rounded-xl flex items-center gap-4 shadow-lg scale-[1.03] transition-all">
                <div className="w-5 h-5 rounded-md border-2 border-primary bg-white flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-primary/20 rounded-sm" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-black dark:text-black">
                  Order healthy groceries for the week ahead
                </span>
                <div className="ml-auto">
                  <span className="bg-primary/10 text-primary uppercase text-[8px] tracking-widest font-bold px-2 py-0.5 rounded-full animate-pulse">
                    IN FOCUS
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Capture Scratchpad interactive transformer */}
        <section id="scratchpad" className="max-w-5xl mx-auto mb-20 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 inline-block mb-3">
              Brain-dump Sandbox
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-on-surface font-semibold">
              Messy brain, clean system.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto mt-2 leading-relaxed">
              Pour your unorganized chaos here. Our integrated Gemini AI isolates actual tasks from background thoughts in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Input terminal */}
            <div className="bg-white border-2 border-on-surface/10 p-6 rounded-xl shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    RAW SCRATCHPAD (TYPE ANYTHING)
                  </span>
                  <span className="text-[9px] font-semibold text-on-surface-variant bg-surface-container py-0.5 px-2 rounded">
                    Editable Client
                  </span>
                </div>

                <textarea
                  className="w-full h-36 p-3 rounded-lg bg-surface-container-low text-xs text-on-surface italic font-medium focus:outline-none focus:ring-1 focus:ring-primary border border-on-surface/5 resize-none leading-relaxed"
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="Type anything, including worries, details, or lists..."
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-[10px] text-on-surface-variant/70 italic flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Multi-modality parser is live
                </span>
                
                <button
                  onClick={triggerScratchpadOrganize}
                  disabled={isOrganizing}
                  className="bg-primary hover:brightness-110 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  {isOrganizing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Distilling...</span>
                    </>
                  ) : (
                    <>
                      <span>Organize Draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cleaned task stream */}
            <div className="bg-white border-2 border-primary/20 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    ORGANIZED FLOW OUTPUT
                  </span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10">
                    Mode: {organizeMode === "gemini" ? "Gemini AI" : "Heuristic Parser"}
                  </span>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {organizedTasks.map((task, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-on-surface/5 group hover:border-primary/20 hover:bg-white transition-all"
                      >
                        <div className="w-7 h-7 rounded-md bg-white border border-on-surface/5 flex items-center justify-center shrink-0">
                          {getCategoryIcon(task.category)}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-on-surface font-semibold truncate">
                            {task.text}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] uppercase tracking-wide font-bold text-primary bg-primary/5 px-1 rounded">
                              {task.category}
                            </span>
                            <span className="text-[8px] uppercase tracking-wide font-bold text-on-surface-variant bg-surface-container px-1 rounded">
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const filtered = organizedTasks.filter((_, i) => i !== idx);
                            setOrganizedTasks(filtered);
                            showToast("Task archived in Spacenos workspace.");
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {organizedTasks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-on-surface-variant italic">No active targets remaining. Add some on the left!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-on-surface/5 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Try pasting your raw thoughts to watch the distillation happen in real-time.</span>
              </div>
            </div>

          </div>
        </section>

        {/* Pricing Plan Cards Section */}
        <section id="pricing" className="max-w-5xl mx-auto py-12 mb-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-on-surface font-semibold">
              Pricing constructed for humans.
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mt-2 leading-relaxed">
              No subscription traps, no dopamine abuse triggers, no guilt indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white border-2 border-on-surface/10 p-8 rounded-2xl shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-on-surface">Spacenos Individual</h3>
                    <p className="text-xs text-on-surface-variant mt-1">For single minds seeking raw cognitive calm.</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest font-black text-primary bg-primary/5 px-2.5 py-1 rounded">
                    Free
                  </span>
                </div>

                <div className="my-6">
                  <span className="font-display text-4xl font-extrabold text-on-surface">$0</span>
                  <span className="text-xs text-on-surface-variant"> / always free</span>
                </div>

                <ul className="space-y-3 border-t border-on-surface/5 pt-6 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Strict 3-Task Active Space (Infinite list barrier)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Sensory scratchpad parser (Heuristic & Local)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Atmospheric sensory white noise generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Minimalist visual layout styled for low cognitive strain</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/planner")}
                className="w-full bg-[#eae0b5] hover:bg-[#dcd0a0] text-[#6a6341] font-semibold text-xs py-3 rounded-xl mt-8 transition-colors"
              >
                Launch Offline sandbox card
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white border-2 border-primary/70 p-8 rounded-2xl shadow-md relative flex flex-col justify-between">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[9px] tracking-wider font-extrabold uppercase px-3 py-1 rounded-full border border-white">
                Best Value
              </div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-on-surface">Spacenos Sync Plus</h3>
                    <p className="text-xs text-on-surface-variant mt-1">For professionals who need cross-device grounding.</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest font-black text-primary bg-primary/10 px-2.5 py-1 rounded">
                    Calm Yearly
                  </span>
                </div>

                <div className="my-6">
                  <span className="font-display text-4xl font-extrabold text-on-surface">$3</span>
                  <span className="text-xs text-on-surface-variant"> / month paid annually</span>
                </div>

                <ul className="space-y-3 border-t border-on-surface/5 pt-6 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-black">Unlimited Server-Side Gemini AI Distillations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Real-time cross-device mobile cloud-sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Calendar integration (Gentle reminders)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Distraction-shielding web browser blocker</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/planner")}
                className="w-full bg-primary hover:brightness-110 text-white font-semibold text-xs py-3 rounded-xl mt-8 transition-all"
              >
                Access Premium Sandbox
              </button>
            </div>

          </div>
        </section>

        {/* Persisted Active sandbox status if user set it up */}
        <AnimatePresence>
          {savedWorkspace && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-20 bg-secondary-container/10 border-2 border-[#eae0b5] p-6 rounded-2xl text-center"
            >
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">
                YOUR SECURE LOCAL WORKSPACE
              </span>
              <h3 className="font-display text-lg text-black font-semibold mb-4">
                Active targets stored in this browser:
              </h3>
              <div className="space-y-2 max-w-md mx-auto text-left">
                {userTasks.map((t, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-[#eae0b5] flex items-center justify-between text-xs">
                    <span className="font-medium truncate text-on-surface">
                      {t ? t : <span className="opacity-40 italic">Empty Slot</span>}
                    </span>
                    <span className="text-[9px] font-bold text-[#6a6341] uppercase tracking-wide bg-[#eae0b5]/40 px-2 py-0.5 rounded">
                      Slot {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem("spacenos_user_tasks");
                    setUserTasks(["", "", ""]);
                    setSavedWorkspace(false);
                    showToast("Browser workspace cleared.");
                  }}
                  className="text-on-surface-variant text-[11px] font-bold hover:text-primary underline flex items-center gap-1"
                >
                  Clear targets
                </button>
                <span className="text-on-surface-variant/30">|</span>
                <button
                  onClick={() => {
                    router.push("/planner");
                  }}
                  className="text-primary text-[11px] font-bold hover:underline flex items-center gap-1"
                >
                  Open your plan
                  </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Final Terracotta CTA Card */}
        <section className="max-w-5xl mx-auto py-6">
          <div className="bg-primary text-white p-8 sm:p-16 rounded-[2rem] text-center relative overflow-hidden shadow-xl border border-white/10">
            {/* Soft geometric styling circles inside banner */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="15" cy="15" fill="white" r="15" />
                <circle cx="85" cy="85" fill="white" r="25" />
              </svg>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="font-display text-2xl sm:text-4xl leading-tight font-semibold">
                Your mind already works hard enough. Let SPACENOS hold the rest.
              </h2>
              
              <div className="pt-4">
                <button
                  onClick={() => router.push("/planner")}
                  className="bg-white text-primary hover:bg-[#fcf9f5] px-10 py-4 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Start Free Now
                </button>
                <p className="text-[10px] tracking-widest font-semibold uppercase opacity-90 mt-4">
                  FREE FOR INDIVIDUAL MINDS. ALWAYS.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Block */}
      <footer className="w-full py-12 px-6 bg-surface-container-highest/30 border-t border-on-surface/10 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              alt="SPACENOS Logo"
              className="h-6 w-auto grayscale contrast-125 opacity-75"
              src="/image.png"
            />
            <p className="text-[11px] text-on-surface-variant font-medium text-center md:text-left">
              © 2026 SPACENOS. Powered by Google AI Studio Build. Spares energy, boosts tranquility.
            </p>
          </div>
          <div className="flex gap-6">
            <button onClick={() => showToast("Spacenos Privacy Policy: We keep storage 100% locally bounded.")} className="text-xs text-on-surface-variant font-semibold hover:text-primary transition-all">
              Privacy
            </button>
            <button onClick={() => showToast("Spacenos Terms: Built on mutual calm.")} className="text-xs text-[#6B6B6B] font-semibold hover:text-primary transition-all">
              Terms
            </button>
            <button onClick={() => showToast("Support active at: care@spacenos.org")} className="text-xs text-[#6B6B6B] font-semibold hover:text-primary transition-all">
              Support
            </button>
            <button onClick={() => showToast("Find us on Twitter: @spacenosapp")} className="text-xs text-[#6B6B6B] font-semibold hover:text-primary transition-all">
              Twitter
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
