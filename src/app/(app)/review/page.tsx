"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Activity,
  Bookmark,
  Calendar,
  HelpCircle,
  BarChart2
} from "lucide-react";

export default function ReviewPage() {
  const [reflection, setReflection] = useState<string>("\"Gentle reflection\"");
  const [standupText, setStandupText] = useState<string>("Click Generate to create your standup update.");
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false);

  // Snapshot states
  const [completedCount, setCompletedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fetch stats from local storage
      const storedPlanner = localStorage.getItem("spacenos_planner_tasks");
      const storedBig3 = localStorage.getItem("spacenos_big_3");

      let done = 0;
      let active = 0;

      if (storedPlanner) {
        try {
          const tasks = JSON.parse(storedPlanner);
          done += tasks.filter((t: any) => t.completed).length;
          active += tasks.filter((t: any) => !t.completed).length;
        } catch (e) {}
      }

      if (storedBig3) {
        try {
          const tasks = JSON.parse(storedBig3);
          done += tasks.filter((t: any) => t.completed).length;
        } catch (e) {}
      }

      setCompletedCount(done);
      setActiveCount(active);
    }
  }, []);

  const reflectionsList = [
    "\"Focus on progress, not perfection. You did what you could today.\"",
    "\"Energy is finite. Protect it like gold and rest when you hit friction.\"",
    "\"Look back at Wednesday. What did your executive battery tell you?\"",
    "\"A single task done with deep clarity outvalues a list of 47 distractions.\"",
    "\"Observe where your focus wandered. Notice it without judgment.\"",
    "\"Calm minds make clear choices. Pause and find the silence first.\""
  ];

  const generateReflection = () => {
    setIsGeneratingReflection(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * reflectionsList.length);
      setReflection(reflectionsList[idx]);
      setIsGeneratingReflection(false);
    }, 600);
  };

  const generateStandup = () => {
    setIsGeneratingStandup(true);
    setTimeout(() => {
      if (completedCount > 0) {
        setStandupText(`Yesterday: ${completedCount} tasks completed. Today: focusing on high-clarity targets. Mind is calm.`);
      } else {
        setStandupText("Yesterday: resting energy reserves. Today: planning exactly 3 things to build momentum.");
      }
      setIsGeneratingStandup(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Zone */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex items-baseline">
        <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F] select-none">
          Review
        </h1>
        <span className="ml-3 text-[11px] font-semibold text-[#6B6B6B] tracking-wide select-none">
          | See what moved. Notice what resisted. Keep it kind.
        </span>
      </div>

      {/* Row 1: Reflections & Standup cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card A: Brain Reflection */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[140px] relative">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                Brain Reflection
              </span>
              <p className="font-display text-lg italic text-[#E14C2A] font-semibold pr-20 leading-relaxed transition-all">
                {reflection}
              </p>
            </div>

            <button
              onClick={generateReflection}
              disabled={isGeneratingReflection}
              className="absolute right-6 top-6 bg-[#FCFAF8] hover:bg-slate-100/50 border border-[rgba(0,0,0,0.06)] text-[#E14C2A] text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all"
            >
              {isGeneratingReflection ? "Thinking..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Card B: Daily Standup */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[140px] relative">
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                Daily Standup
              </span>
              <div className="text-[11px] font-semibold text-black space-y-1 pr-24 leading-relaxed">
                {standupText === "Click Generate to create your standup update." ? (
                  <>
                    <p className="text-[#6B6B6B]">Yesterday: {completedCount} tasks done</p>
                    <p className="text-[#6B6B6B]">Today: {activeCount} tasks planned</p>
                    <p className="text-[10px] text-[#6B6B6B]/80 italic mt-2">{standupText}</p>
                  </>
                ) : (
                  <p className="text-black font-semibold italic">{standupText}</p>
                )}
              </div>
            </div>

            <button
              onClick={generateStandup}
              disabled={isGeneratingStandup}
              className="absolute right-6 top-6 bg-[#E14C2A] hover:brightness-110 text-white text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all shadow-xs"
            >
              {isGeneratingStandup ? "Updating..." : "Generate"}
            </button>
          </div>
        </div>

      </div>

      {/* Row 2: Snapshot, Activity, Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Snapshot */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-4">
              Snapshot
            </span>

            <div className="space-y-3 text-xs font-semibold text-black">
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B6B]">Done (7 days)</span>
                <span className="font-bold">{completedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B6B]">Active</span>
                <span className="font-bold">{activeCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B6B]">Procrastination score</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B6B]">Sessions this week</span>
                <span className="font-bold">{sessionsCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 mt-4">
            <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Most Postponed
            </span>
            <span className="text-xs font-bold text-black block mt-0.5">—</span>
          </div>
        </div>

        {/* Card B: Activity */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col min-h-[220px]">
          <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-4">
            Activity (Hour of Day)
          </span>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-[#FCEBE6] border border-[#E14C2A]/10 flex items-center justify-center text-primary mb-3">
              <Clock className="w-5 h-5 text-[#E14C2A]" />
            </div>
            <h4 className="text-xs font-bold text-black mb-1">No focus sessions yet</h4>
            <p className="text-[10px] text-[#6B6B6B] font-medium max-w-[160px] leading-relaxed">
              Complete a focus session to see your pattern.
            </p>
          </div>
        </div>

        {/* Card C: Streak */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-4">
              Streak
            </span>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF8] border border-[rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#FCEBE6] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-[#E14C2A]" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-black">Streak paused</h4>
                <span className="text-[9px] text-[#E14C2A] font-bold block mt-0.5">
                  Complete 1 task to restart
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 mt-4">
            <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Wins (7 days)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-4xl font-extrabold text-black tracking-tight leading-none">
                {completedCount}
              </span>
              <span className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">
                tasks done
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Focus History */}
      <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.06)] pb-3">
          <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider select-none">
            Focus History
          </span>
          <span className="text-[10px] text-[#6B6B6B] italic font-medium">
            {sessionsCount} total sessions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Left Column: Last 14 Days grid */}
          <div className="space-y-4">
            <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Last 14 Days
            </span>

            <div className="space-y-3">
              {/* Horizontal block grid */}
              <div className="flex items-end justify-between h-12 gap-1.5 px-2">
                {[...Array(14)].map((_, idx) => {
                  const isActiveToday = idx === 13;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 space-y-1.5">
                      <div
                        className={`w-full rounded-xs transition-all ${
                          isActiveToday && completedCount > 0
                            ? "h-8 bg-[#E14C2A]"
                            : "h-1.5 bg-[rgba(0,0,0,0.08)]"
                        }`}
                      />
                      {isActiveToday && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E14C2A]" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest px-2">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Sessions */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-l border-[rgba(0,0,0,0.06)] pl-8">
            <div className="w-9 h-9 rounded-xl bg-[#FCEBE6] border border-[#E14C2A]/10 flex items-center justify-center text-primary mb-2">
              <Clock className="w-4.5 h-4.5 text-[#E14C2A]" />
            </div>
            <h5 className="text-[11px] font-bold text-black mb-0.5">No sessions yet</h5>
            <p className="text-[9px] text-[#6B6B6B] font-medium leading-relaxed">
              Start your first focus session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
