"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Sparkles,
  ArrowRight,
  Trash2,
  Plus,
  Mail,
  Phone,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Inbox,
  AlertCircle
} from "lucide-react";

interface OrganizedTask {
  text: string;
  category: string;
  priority: string;
  completed: boolean;
}

export default function CapturePage() {
  const [scratchpadText, setScratchpadText] = useState<string>(
    "write the monthly product newsletter draft by friday\nneed to buy milk, bread and eggs on the way back\nemail David to reschedule the product roadmap checkin\npay power bill!"
  );
  const [organizedTasks, setOrganizedTasks] = useState<OrganizedTask[]>([]);
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [organizeMode, setOrganizeMode] = useState<string>("default");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("mail") || cat.includes("email") || cat.includes("sarah") || cat.includes("david")) {
      return <Mail className="w-4 h-4 text-primary animate-pulse" />;
    }
    if (cat.includes("call") || cat.includes("phone") || cat.includes("mom")) {
      return <Phone className="w-4 h-4 text-primary animate-pulse" />;
    }
    if (cat.includes("grocery") || cat.includes("groceries") || cat.includes("buy") || cat.includes("staples") || cat.includes("milk")) {
      return <ShoppingCart className="w-4 h-4 text-primary animate-pulse" />;
    }
    if (cat.includes("rent") || cat.includes("pay") || cat.includes("bill") || cat.includes("power")) {
      return <CreditCard className="w-4 h-4 text-primary animate-pulse" />;
    }
    return <Sparkles className="w-4 h-4 text-primary animate-pulse" />;
  };

  const triggerOrganize = async () => {
    if (!scratchpadText.trim()) {
      setStatusMessage("Your scratchpad dump container is empty.");
      return;
    }

    setIsOrganizing(true);
    setStatusMessage(null);

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
        setStatusMessage(
          data.mode === "gemini"
            ? "Gemini AI isolated actionable micro-tasks beautifully!"
            : "Parsed structure using fallback heuristics."
        );
      }
    } catch (e: any) {
      setStatusMessage("Fallback parser active. Kept experience fully responsive.");
    } finally {
      setIsOrganizing(false);
    }
  };

  // Promotion helpers
  const promoteToPlanner = (task: OrganizedTask) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_planner_tasks");
      const currentPlanner = stored ? JSON.parse(stored) : [];
      
      const newPlannerTask = {
        id: Date.now().toString(),
        text: task.text,
        completed: false,
        priority: ["High", "Medium", "Low"].includes(task.priority) ? task.priority : "Medium",
        date: new Date().toISOString().split("T")[0]
      };

      localStorage.setItem("spacenos_planner_tasks", JSON.stringify([...currentPlanner, newPlannerTask]));
      
      // Filter out of capture view
      setOrganizedTasks(organizedTasks.filter((t) => t.text !== task.text));
      setStatusMessage(`"${task.text}" added directly to Planner cards.`);
    }
  };

  const promoteToBig3 = (task: OrganizedTask) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_big_3");
      const currentBig3 = stored ? JSON.parse(stored) : [];

      if (currentBig3.length >= 3) {
        alert("Your Big 3 list is already full. Complete or delete items there first.");
        return;
      }

      localStorage.setItem("spacenos_big_3", JSON.stringify([...currentBig3, { text: task.text, completed: false }]));
      
      // Filter out of capture view
      setOrganizedTasks(organizedTasks.filter((t) => t.text !== task.text));
      setStatusMessage(`"${task.text}" loaded into Focus Today's Big 3.`);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" /> Idea Sandbox
        </span>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
          Messy Capture
        </h1>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
          Unload everything in your working memory. We will distill the clutter into actionable outcomes.
        </p>
      </div>

      {/* Action Notification Alert Toast Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-primary shrink-0 animate-bounce" />
            <p className="text-xs text-[#6B6B6B] font-medium">
              {statusMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Input Sandbox Container */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                RAW COGNITIVE DUMP
              </span>
              <span className="text-[9px] font-semibold text-[#6B6B6B] bg-slate-100 py-0.5 px-2 rounded">
                Type messy thoughts
              </span>
            </div>

            <textarea
              className="w-full h-48 p-4 rounded-xl bg-[#F8F5F1] text-xs text-[#1F1F1F] italic font-medium focus:outline-none focus:ring-1 focus:ring-primary border border-[rgba(0,0,0,0.04)] resize-none leading-relaxed"
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              placeholder="Dump chores, details, reminders, notes, emails to write..."
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[rgba(0,0,0,0.04)] pt-4">
            <span className="text-[10px] text-[#6B6B6B] italic flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Connected to Gemini Core
            </span>
            
            <button
              onClick={triggerOrganize}
              disabled={isOrganizing}
              className="bg-[#E14C2A] hover:brightness-110 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              {isOrganizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Distilling...</span>
                </>
              ) : (
                <>
                  <span>Extract Targets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Organized Action Feed Column */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-[#E14C2A] uppercase tracking-widest">
                DISTILLED OUTCOMES
              </span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-[#FCEBE6] px-2.5 py-0.5 rounded border border-primary/10">
                Mode: {organizeMode === "gemini" ? "Gemini AI" : "Heuristic Parser"}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {organizedTasks.map((task, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F1] border border-[rgba(0,0,0,0.04)] group hover:border-primary/20 hover:bg-white transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-center shrink-0">
                      {getCategoryIcon(task.category)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#1F1F1F] font-semibold truncate">
                        {task.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] uppercase tracking-wide font-bold text-primary bg-[#FCEBE6] px-1 rounded">
                          {task.category}
                        </span>
                        <span className="text-[8px] uppercase tracking-wide font-bold text-[#6B6B6B] bg-slate-200/50 px-1 rounded">
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Push to Big 3 */}
                      <button
                        onClick={() => promoteToBig3(task)}
                        className="p-1 text-[#6B6B6B] hover:text-[#E14C2A] rounded transition-colors"
                        title="Add to focus Big 3"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>

                      {/* Push to planner board */}
                      <button
                        onClick={() => promoteToPlanner(task)}
                        className="p-1 text-[#6B6B6B] hover:text-[#E14C2A] rounded transition-colors"
                        title="Queue in planner board"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove item */}
                      <button
                        onClick={() => {
                          const filtered = organizedTasks.filter((_, i) => i !== idx);
                          setOrganizedTasks(filtered);
                        }}
                        className="p-1 text-[#6B6B6B] hover:text-red-500 rounded transition-colors"
                        title="Dismiss outcome"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {organizedTasks.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <Inbox className="w-8 h-8 text-[#6B6B6B] opacity-40 mb-2" />
                  <p className="text-xs text-[#6B6B6B] italic">
                    No active targets remaining. Add clutter to the dump and run extraction!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.04)] text-[9px] text-[#6B6B6B] font-semibold leading-relaxed">
            Extract targets to clean the slate. Click the icons beside each task to load them into your Focus list or Planner schedule.
          </div>
        </div>

      </div>
    </div>
  );
}
