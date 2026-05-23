"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  Bookmark,
  CheckCircle,
  Inbox
} from "lucide-react";

interface WeeklyReview {
  id: string;
  date: string;
  wentWell: string;
  friction: string;
  clarity: number;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [wentWell, setWentWell] = useState("");
  const [friction, setFriction] = useState("");
  const [clarity, setClarity] = useState(7);
  const [completedCount, setCompletedCount] = useState(0);

  // Load / Save Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_reviews");
      if (stored) {
        try {
          setReviews(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Sample seed review
        const seedReviews: WeeklyReview[] = [
          {
            id: "1",
            date: "May 17, 2026",
            wentWell: "Managed to limit tasks to exactly 3 per day, avoided starting too many items.",
            friction: "Got distracted during the middle of Wednesday due to team board chats.",
            clarity: 8
          }
        ];
        setReviews(seedReviews);
        localStorage.setItem("spacenos_reviews", JSON.stringify(seedReviews));
      }

      // Check planner tasks count to display some stats
      const storedPlanner = localStorage.getItem("spacenos_planner_tasks");
      if (storedPlanner) {
        try {
          const tasks = JSON.parse(storedPlanner);
          const done = tasks.filter((t: any) => t.completed).length;
          setCompletedCount(done);
        } catch (e) {}
      }
    }
  }, []);

  const saveReviews = (updated: WeeklyReview[]) => {
    setReviews(updated);
    localStorage.setItem("spacenos_reviews", JSON.stringify(updated));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wentWell.trim() || !friction.trim()) return;

    const newReview: WeeklyReview = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      wentWell: wentWell.trim(),
      friction: friction.trim(),
      clarity
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    
    // Reset form fields
    setWentWell("");
    setFriction("");
    setClarity(7);
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    saveReviews(updated);
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Weekly Reflections
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            Weekly Review
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Reflect on what went well, diagnose cognitive frictions, and track your focus clarity over time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side Column: Review input panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs">
            <h3 className="font-display text-sm font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 mb-4">
              Submit Review Page
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  What went well this week?
                </label>
                <textarea
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="e.g. Cleared my task lists and kept my executive battery recharged."
                  className="w-full text-xs p-3 h-20 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Where did you hit friction?
                </label>
                <textarea
                  value={friction}
                  onChange={(e) => setFriction(e.target.value)}
                  placeholder="e.g. Distracted during Wednesday sessions by context switching."
                  className="w-full text-xs p-3 h-20 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium resize-none leading-relaxed"
                />
              </div>

              {/* Slider clarity value */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                    Cognitive Clarity Level
                  </label>
                  <span className="text-xs font-bold text-primary">{clarity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={clarity}
                  onChange={(e) => setClarity(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest mt-1">
                  <span>Fatigued</span>
                  <span>Focused</span>
                  <span>Zen Clarity</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E14C2A] hover:brightness-110 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Weekly Journal</span>
              </button>
            </form>
          </div>

          {/* History of submissions */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs">
            <h3 className="font-display text-sm font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 mb-4">
              Reflection Log
            </h3>

            <div className="space-y-4">
              <AnimatePresence>
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-[#FCFAF8] border border-[rgba(0,0,0,0.05)] space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-primary" /> {rev.date}
                      </span>
                      <span className="text-[9px] font-black text-primary bg-[#FCEBE6] py-0.5 px-2 rounded-full uppercase tracking-wider">
                        Clarity: {rev.clarity}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Wins</span>
                        <p className="text-black font-semibold mt-0.5 leading-relaxed">{rev.wentWell}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Frictions</span>
                        <p className="text-[#6B6B6B] font-medium mt-0.5 leading-relaxed">{rev.friction}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 text-[#6B6B6B] hover:text-[#E14C2A] transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {reviews.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <Inbox className="w-8 h-8 text-[#6B6B6B] opacity-35 mb-2" />
                  <p className="text-xs text-[#6B6B6B] italic">No Reflection Logs recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Column: Stats cards */}
        <div className="space-y-6">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs">
            <h3 className="font-display text-sm font-semibold text-black mb-4">
              Calm Achievements
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF8] border border-[rgba(0,0,0,0.04)]">
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black">Targets Cleared</h4>
                  <p className="text-[10px] text-[#6B6B6B] font-medium mt-0.5">
                    {completedCount} tasks checked in planner.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF8] border border-[rgba(0,0,0,0.04)]">
                <div className="w-9 h-9 rounded-full bg-[#E14C2A]/10 border border-[#E14C2A]/20 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black">Clarity Average</h4>
                  <p className="text-[10px] text-[#6B6B6B] font-medium mt-0.5">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + r.clarity, 0) / reviews.length).toFixed(1)
                      : 0}{" "}
                    / 10 points this period.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
