"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Coffee,
  Check,
  AlertCircle
} from "lucide-react";

interface BigTask {
  text: string;
  completed: boolean;
}

export default function FocusPage() {
  // Pomodoro states
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  // Big 3 Tasks states
  const [big3, setBig3] = useState<BigTask[]>([
    { text: "Complete routing configurations inside Route Groups", completed: false },
    { text: "Structure gorgeous custom UI layouts using Lexend", completed: false },
    { text: "Verify Next.js build compilation outputs", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio trigger click
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load from local storage if existing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_big_3");
      if (stored) {
        try {
          setBig3(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveBig3 = (updated: BigTask[]) => {
    setBig3(updated);
    localStorage.setItem("spacenos_big_3", JSON.stringify(updated));
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete!
            playCompletionChime();
            if (mode === "focus") {
              setMode("break");
              setMinutes(5);
              setSeconds(0);
              setIsActive(false);
              alert("Focus session complete! Rest your executive battery with a 5-minute break.");
            } else {
              setMode("focus");
              setMinutes(25);
              setSeconds(0);
              setIsActive(false);
              alert("Break is over! Time to get back into focus zone.");
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds, mode]);

  // Cozy completion sound synth (Web Audio)
  const playCompletionChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Calm, pentatonic dopamine ring
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === "focus" ? 25 : 5);
    setSeconds(0);
  };

  const setTimerMode = (newMode: "focus" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === "focus" ? 25 : 5);
    setSeconds(0);
  };

  // Add Task to Big 3
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    if (big3.length >= 3) {
      alert("Spacenos restricts focus to exactly 3 items at a time to prevent cognitive fatigue.");
      return;
    }

    const updated = [...big3, { text: newTaskText.trim(), completed: false }];
    saveBig3(updated);
    setNewTaskText("");
  };

  const toggleTask = (index: number) => {
    const updated = [...big3];
    updated[index].completed = !updated[index].completed;
    saveBig3(updated);

    // Play subtle chime when task is checked
    if (updated[index].completed) {
      playCompletionChime();
    }
  };

  const removeTask = (index: number) => {
    const updated = big3.filter((_, idx) => idx !== index);
    saveBig3(updated);
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top calm header */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
          <Target className="w-3.5 h-3.5 text-primary" /> Sensory Zone
        </span>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
          Focus Mode
        </h1>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
          A dedicated container for single-task focus. No notifications, no guilt indicators, just progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Pomodoro Zone */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-8 rounded-2xl shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full">
            {/* Timer Toggle Headers */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setTimerMode("focus")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === "focus"
                    ? "bg-[#FCEBE6] text-[#E14C2A]"
                    : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                }`}
              >
                <Clock className="w-4 h-4" /> Focus Block
              </button>
              <button
                onClick={() => setTimerMode("break")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === "break"
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                }`}
              >
                <Coffee className="w-4 h-4" /> Quiet Break
              </button>
            </div>

            {/* Countdown Graphic representation */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-dashed border-[rgba(0,0,0,0.08)] flex items-center justify-center relative">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle className="text-transparent" cx="128" cy="128" fill="transparent" r="110" />
                  <motion.circle
                    className={mode === "focus" ? "text-primary" : "text-emerald-500"}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="110"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="691"
                    animate={{
                      strokeDashoffset:
                        691 -
                        (691 *
                          (minutes * 60 + seconds)) /
                          ((mode === "focus" ? 25 : 5) * 60)
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                <div className="space-y-1">
                  <span className="text-6xl font-extrabold text-[#1F1F1F] tracking-tighter tabular-nums select-none block">
                    {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-bold">
                    {isActive ? "Zone active" : "paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full flex justify-center gap-4 mt-6">
            <button
              onClick={toggleTimer}
              className={`flex-1 max-w-[160px] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-white border-2 border-[rgba(0,0,0,0.06)] hover:bg-[#FCEBE6]/10 text-primary"
                  : "bg-primary text-white hover:brightness-110"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" /> Pause session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start session
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-xl border border-[rgba(0,0,0,0.06)] text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F8F5F1] transition-all"
              title="Reset Pomodoro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Today's Big 3 targets list */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-8 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[rgba(0,0,0,0.06)]">
              <h3 className="font-display text-base font-semibold text-black">
                Today's Core 3 Focus
              </h3>
              <span className="text-[9px] font-black text-primary bg-[#FCEBE6] py-1 px-2.5 rounded-full uppercase tracking-wider">
                {big3.filter((t) => t.completed).length}/3 completed
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {big3.map((task, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                      task.completed
                        ? "bg-[#FCFAF8] border-outline-variant opacity-70"
                        : "bg-white border-primary/20 hover:border-primary"
                    }`}
                  >
                    <div
                      className="flex items-center gap-4 flex-1"
                      onClick={() => toggleTask(idx)}
                    >
                      <button className="shrink-0 transition-colors">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-primary fill-primary/10" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[rgba(0,0,0,0.06)] group-hover:border-primary" />
                        )}
                      </button>

                      <span className={`text-xs font-semibold font-sans leading-relaxed ${
                        task.completed ? "line-through text-[#6B6B6B]" : "text-black"
                      }`}>
                        {task.text}
                      </span>
                    </div>

                    <button
                      onClick={() => removeTask(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#6B6B6B] hover:text-[#E14C2A] transition-opacity shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {big3.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[rgba(0,0,0,0.06)] rounded-xl">
                  <p className="text-xs text-on-surface-variant italic">
                    Your focus workspace is empty. Limit yourself to only 3 items below!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Core 3 add input form */}
          {big3.length < 3 ? (
            <form onSubmit={handleAddTask} className="mt-8 space-y-3">
              <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                Queue another core priority:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="e.g. Schedule design check-ins"
                  className="flex-1 text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#E14C2A] text-white hover:brightness-110 px-4 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 p-3 rounded-lg bg-[#FCFAF8] border border-[rgba(0,0,0,0.06)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E14C2A] shrink-0" />
              <p className="text-[10px] text-[#6B6B6B] font-semibold leading-relaxed">
                Maximum focus capacity active. Finish an item or remove a slot before loading more. Avoid overload fatigue!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
