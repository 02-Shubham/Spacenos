"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smile,
  AlertCircle,
  TrendingUp,
  Inbox,
  Trash2,
  Lock,
} from "lucide-react";

interface PlannerTask {
  id: string;
  text: string;
  timeSlot?: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  date: string; // YYYY-MM-DD
}

export default function PlannerPage() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00 AM");
  const [selectedPriority, setSelectedPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Load / Save Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_planner_tasks");
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Default seed tasks for today
        const todayStr = new Date().toISOString().split("T")[0];
        const defaultTasks: PlannerTask[] = [
          { id: "1", text: "Deep work session: Refactor dashboard routing", timeSlot: "09:00 AM", completed: false, priority: "High", date: todayStr },
          { id: "2", text: "Walk around the park to clear cognitive load", timeSlot: "02:00 PM", completed: true, priority: "Medium", date: todayStr },
          { id: "3", text: "Write reflections inside Weekly Review tab", timeSlot: "05:00 PM", completed: false, priority: "Low", date: todayStr }
        ];
        setTasks(defaultTasks);
        localStorage.setItem("spacenos_planner_tasks", JSON.stringify(defaultTasks));
      }
    }
  }, []);

  const saveTasks = (newTasks: PlannerTask[]) => {
    setTasks(newTasks);
    localStorage.setItem("spacenos_planner_tasks", JSON.stringify(newTasks));
  };

  const getTodayStr = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: PlannerTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      timeSlot: viewMode === "day" ? selectedTimeSlot : undefined,
      completed: false,
      priority: selectedPriority,
      date: getTodayStr(currentDate)
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // Navigating dates
  const adjustDate = (amount: number) => {
    const newD = new Date(currentDate);
    if (viewMode === "day") {
      newD.setDate(newD.getDate() + amount);
    } else if (viewMode === "week") {
      newD.setDate(newD.getDate() + amount * 7);
    } else {
      newD.setMonth(newD.getMonth() + amount);
    }
    setCurrentDate(newD);
  };

  const formattedHeaderDate = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    } else if (viewMode === "week") {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  };

  // Day timeslots for the schedule timeline
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  const todayTasks = tasks.filter((t) => t.date === getTodayStr(currentDate));

  // Week View Calculations
  const getWeekDates = () => {
    const dates = [];
    const base = new Date(currentDate);
    const day = base.getDay();
    base.setDate(base.getDate() - day); // Start of week (Sunday)
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(base));
      base.setDate(base.getDate() + 1);
    }
    return dates;
  };

  // Month View Calculations
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for starting offset
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Upper Calm Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(0,0,0,0.06)] pb-6">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Organizer
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            The Calm Planner
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Gently map out what matters, while ignoring the noise of typical high-stress calendars.
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-[rgba(0,0,0,0.06)]">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? "bg-white text-primary shadow-sm"
                  : "text-[#6B6B6B] hover:text-[#1F1F1F]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation Controls */}
      <div className="flex justify-between items-center bg-white border border-[rgba(0,0,0,0.06)] p-3 rounded-xl shadow-xs">
        <button
          onClick={() => adjustDate(-1)}
          className="p-1.5 rounded-lg border border-[rgba(0,0,0,0.06)] hover:bg-[#FCEBE6]/20 transition-all text-[#6B6B6B] hover:text-[#E14C2A]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-[#1F1F1F] tracking-wide uppercase">
          {formattedHeaderDate()}
        </span>

        <button
          onClick={() => adjustDate(1)}
          className="p-1.5 rounded-lg border border-[rgba(0,0,0,0.06)] hover:bg-[#FCEBE6]/20 transition-all text-[#6B6B6B] hover:text-[#E14C2A]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Views Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left/Main Column: The Schedule or Board */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {viewMode === "day" && (
              <motion.div
                key="day-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 shadow-xs space-y-4"
              >
                <h3 className="font-display text-lg font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3">
                  Day Schedule Timeline
                </h3>

                <div className="space-y-4">
                  {timeSlots.map((slot) => {
                    const slotTasks = todayTasks.filter((t) => t.timeSlot === slot);
                    return (
                      <div key={slot} className="flex gap-4 items-start group">
                        <span className="text-[10px] font-bold text-[#6B6B6B] w-16 pt-2 select-none">
                          {slot}
                        </span>
                        
                        <div className="flex-1 min-h-[3.5rem] border-l border-[rgba(0,0,0,0.06)] pl-4 space-y-2">
                          {slotTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border-2 text-xs flex items-center justify-between group/task transition-all ${
                                task.completed
                                  ? "bg-surface-container-low border-on-surface/5 opacity-70"
                                  : task.priority === "High"
                                  ? "bg-[#FCEBE6] border-[#E14C2A] text-black"
                                  : "bg-white border-[rgba(0,0,0,0.06)] text-black"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleTask(task.id)}
                                  className="w-4 h-4 rounded-full border border-primary flex items-center justify-center bg-white shadow-xs shrink-0"
                                >
                                  {task.completed && <Check className="w-2.5 h-2.5 text-primary" />}
                                </button>
                                <span className={task.completed ? "line-through text-[#6B6B6B]" : "font-semibold"}>
                                  {task.text}
                                </span>
                              </div>

                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover/task:opacity-100 p-1 text-[#6B6B6B] hover:text-primary transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {slotTasks.length === 0 && (
                            <button
                              onClick={() => {
                                setSelectedTimeSlot(slot);
                                const el = document.getElementById("planner-input-focus");
                                if (el) el.focus();
                              }}
                              className="text-[10px] text-[#6B6B6B] hover:text-[#E14C2A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 py-1"
                            >
                              <Plus className="w-3 h-3" /> Block time slot
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {viewMode === "week" && (
              <motion.div
                key="week-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-display text-lg font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 mb-4">
                  Weekly Board
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {getWeekDates().map((d, index) => {
                    const dStr = getTodayStr(d);
                    const isToday = dStr === getTodayStr(new Date());
                    const weekTasks = tasks.filter((t) => t.date === dStr);
                    
                    return (
                      <div
                        key={index}
                        className={`flex flex-col rounded-xl border p-3 min-h-[220px] transition-colors ${
                          isToday
                            ? "bg-[#FCEBE6]/30 border-[#E14C2A] shadow-xs"
                            : "bg-surface-container-lowest border-[rgba(0,0,0,0.06)]"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          isToday ? "text-[#E14C2A]" : "text-[#6B6B6B]"
                        }`}>
                          {d.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-xs font-bold text-[#1F1F1F] mb-3">
                          {d.getDate()}
                        </span>

                        <div className="flex-1 space-y-2">
                          {weekTasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => toggleTask(task.id)}
                              className={`p-2 rounded-lg border text-[10px] leading-tight cursor-pointer transition-all ${
                                task.completed
                                  ? "bg-surface-container-low border-on-surface/5 opacity-60 line-through text-[#6B6B6B]"
                                  : "bg-white border-[rgba(0,0,0,0.06)] hover:border-primary font-medium"
                              }`}
                            >
                              {task.text}
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setCurrentDate(d);
                            const el = document.getElementById("planner-input-focus");
                            if (el) el.focus();
                          }}
                          className="mt-2 text-[8px] text-[#6B6B6B] hover:text-[#E14C2A] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" /> Add Target
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {viewMode === "month" && (
              <motion.div
                key="month-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-display text-lg font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 mb-4">
                  Month Grid View
                </h3>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getMonthDays().map((d, index) => {
                    if (!d) return <div key={`empty-${index}`} className="aspect-square bg-slate-50/50 rounded-lg border border-transparent" />;
                    
                    const dStr = getTodayStr(d);
                    const isToday = dStr === getTodayStr(new Date());
                    const monthTasks = tasks.filter((t) => t.date === dStr);
                    const incompleteCount = monthTasks.filter((t) => !t.completed).length;

                    return (
                      <div
                        key={dStr}
                        onClick={() => setCurrentDate(d)}
                        className={`aspect-square p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          isToday
                            ? "border-[#E14C2A] bg-[#FCEBE6]/20 font-bold"
                            : "border-[rgba(0,0,0,0.06)] bg-[#FCFAF8] hover:border-primary"
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-[#1F1F1F]">
                          {d.getDate()}
                        </span>
                        
                        {incompleteCount > 0 && (
                          <div className="flex items-center justify-center">
                            <span className="w-5 h-5 rounded-full bg-[#E14C2A] text-white text-[8px] flex items-center justify-center font-bold">
                              {incompleteCount}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Control Bar: Quick Add task box and Progress Ring */}
        <div className="space-y-6">
          {/* Quick Add Section */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs">
            <h3 className="font-display text-sm font-semibold text-black mb-4">
              Add Planner Target
            </h3>

            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Target Task Title
                </label>
                <input
                  id="planner-input-focus"
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What must be done?"
                  className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              {viewMode === "day" && (
                <div>
                  <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                    Target Time Block
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Dopamine Priority Badge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["High", "Medium", "Low"] as const).map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setSelectedPriority(prio)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedPriority === prio
                          ? "bg-[#E14C2A] text-white border-transparent"
                          : "bg-[#F8F5F1] text-[#6B6B6B] border-[rgba(0,0,0,0.06)] hover:bg-[#FCEBE6]/20"
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E14C2A] hover:brightness-110 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Time-block</span>
              </button>
            </form>
          </div>

          {/* Daily Battery Metaphor */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-display text-sm font-semibold text-black">
              Executive Battery
            </h3>

            <div className="flex items-center justify-center py-4">
              {/* SVG Ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-[#ECE7E0]" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="6" />
                  <motion.circle
                    className="text-primary"
                    cx="56"
                    cy="56"
                    fill="transparent"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray="301.6"
                    initial={{ strokeDashoffset: 301.6 }}
                    animate={{
                      strokeDashoffset:
                        301.6 -
                        (301.6 *
                          (todayTasks.length > 0
                            ? todayTasks.filter((t) => t.completed).length / todayTasks.length
                            : 0)) /
                          100 *
                          100
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#1F1F1F]">
                    {todayTasks.length > 0
                      ? Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-[#6B6B6B] font-bold">
                    Recharged
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#6B6B6B] font-semibold leading-relaxed px-2">
              Every completed goal gives back cognitive capacity. Do not fill your battery to 100% just to crash—plan gently.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
