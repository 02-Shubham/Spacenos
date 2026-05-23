"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  MessageSquare,
  Activity,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Send,
  Sparkles,
  Award
} from "lucide-react";

interface TeamMember {
  name: string;
  avatar: string;
  status: "Focusing" | "Idea Storming" | "Quiet Break" | "Offline";
  currentTask: string;
  pomodoros: number;
  completedTasks: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

export default function TeamPage() {
  const [myStatus, setMyStatus] = useState<"Focusing" | "Idea Storming" | "Quiet Break" | "Offline">("Focusing");
  const [myTask, setMyTask] = useState("Refactoring team board layout");
  const [feed, setFeed] = useState<ActivityItem[]>([
    { id: "1", user: "Sarah K.", action: "completed focus session (25m - UI design)", time: "10 mins ago" },
    { id: "2", user: "Mikael R.", action: "added task: 'Integrate SVG connector lines'", time: "25 mins ago" },
    { id: "3", user: "Elena D.", action: "went on a Quiet Break", time: "1 hour ago" }
  ]);
  const [newChatText, setNewChatText] = useState("");

  const teamMembers: TeamMember[] = [
    { name: "Sarah K.", avatar: "SK", status: "Focusing", currentTask: "Drafting marketing pitch", pomodoros: 4, completedTasks: 3 },
    { name: "Mikael R.", avatar: "MR", status: "Idea Storming", currentTask: "Drawing map node flows", pomodoros: 2, completedTasks: 1 },
    { name: "Elena D.", avatar: "ED", status: "Quiet Break", currentTask: "Listening to brown frequency", pomodoros: 3, completedTasks: 4 },
    { name: "Julian P.", avatar: "JP", status: "Offline", currentTask: "Offline rest block", pomodoros: 0, completedTasks: 0 }
  ];

  const handlePostFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      user: "You",
      action: `shared update: "${newChatText.trim()}"`,
      time: "Just now"
    };

    setFeed([newItem, ...feed]);
    setNewChatText("");
  };

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "Focusing":
        return "bg-primary text-white";
      case "Idea Storming":
        return "bg-amber-500 text-white";
      case "Quiet Break":
        return "bg-emerald-500 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> Shared Sanctuary
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            Co-Working Board
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            A calm collaborative dashboard. See your team's energy states without hyper-stimulating chatter.
          </p>
        </div>

        {/* My Status Dock */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[rgba(0,0,0,0.06)] shadow-xs">
          <div className="text-left shrink-0">
            <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Your State</span>
            <span className="text-[10px] font-bold text-black">{myStatus}</span>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded border border-[rgba(0,0,0,0.02)]">
            {(["Focusing", "Idea Storming", "Quiet Break"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setMyStatus(st)}
                className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${
                  myStatus === st
                    ? "bg-white text-primary shadow-xs"
                    : "text-[#6B6B6B] hover:text-black"
                }`}
              >
                {st.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Active team states */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs">
            <h3 className="font-display text-lg font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 mb-6">
              Active Co-Workers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="p-4 rounded-xl border border-[rgba(0,0,0,0.05)] bg-[#FCFAF8] hover:border-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E14C2A]/10 border border-[#E14C2A]/20 flex items-center justify-center text-xs font-bold text-[#E14C2A]">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black">{member.name}</h4>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide inline-block mt-0.5 ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-bold text-black flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-primary" /> {member.pomodoros} Blocks
                      </div>
                      <span className="text-[8px] text-[#6B6B6B] block">
                        {member.completedTasks} targets complete
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[rgba(0,0,0,0.03)] pt-3">
                    <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Current focus target</span>
                    <p className="text-xs font-medium text-black truncate mt-0.5">
                      {member.currentTask}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Coworking activity stream */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-black pb-2 border-b border-[rgba(0,0,0,0.06)]">
              Activity Stream
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {feed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs flex flex-col space-y-0.5 border-l-2 border-[#E14C2A]/20 pl-3 py-1 bg-[#FCFAF8] rounded-r p-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black">{item.user}</span>
                      <span className="text-[8px] text-[#6B6B6B]">{item.time}</span>
                    </div>
                    <span className="text-[#6B6B6B] font-medium leading-relaxed">
                      {item.action}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Activity status posting form */}
          <form onSubmit={handlePostFeed} className="mt-6 border-t border-[rgba(0,0,0,0.06)] pt-4">
            <div className="relative">
              <input
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                placeholder="Log a focus milestone..."
                className="w-full text-xs pr-10 pl-3 py-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.04)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 text-primary hover:brightness-95 transition-all rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
