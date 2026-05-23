"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  Volume2,
  User,
  Sliders,
  Sparkles,
  Save,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function SettingsPage() {
  const [userName, setUserName] = useState("Productivity Seeker");
  const [workspaceName, setWorkspaceName] = useState("North Star");
  const [noiseVolume, setNoiseVolume] = useState(40);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("spacenos_user_name");
      const savedWorkspace = localStorage.getItem("spacenos_workspace_name");
      const savedVol = localStorage.getItem("spacenos_noise_vol");

      if (savedUser) setUserName(savedUser);
      if (savedWorkspace) setWorkspaceName(savedWorkspace);
      if (savedVol) setNoiseVolume(Number(savedVol));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("spacenos_user_name", userName.trim());
      localStorage.setItem("spacenos_workspace_name", workspaceName.trim());
      localStorage.setItem("spacenos_noise_vol", noiseVolume.toString());
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);

      // Force dispatch storage event or redirect/notify layout
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <SettingsIcon className="w-3.5 h-3.5 text-primary animate-spin-slow" /> Preferences
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            Settings Console
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Configure your workspace tags, personal identifiers, and sensory audio thresholds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left main form column */}
        <div className="md:col-span-2 bg-white border border-[rgba(0,0,0,0.06)] p-6 sm:p-8 rounded-2xl shadow-xs">
          
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="font-display text-base font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Profile Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Workspace Title
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>
            </div>

            <h3 className="font-display text-base font-semibold text-black border-b border-[rgba(0,0,0,0.06)] pb-3 flex items-center gap-2 pt-4">
              <Sliders className="w-4 h-4 text-primary" /> Audio Sensory Sanctuary
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-primary" /> Brownian focus volume
                </label>
                <span className="text-xs font-bold text-primary">{noiseVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={noiseVolume}
                onChange={(e) => setNoiseVolume(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest block mt-1">
                Applies directly to Brownian focus synthesis controls.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Settings updated!
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#E14C2A] hover:brightness-110 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save preferences</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right instructions panel */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Info
          </h4>
          <p className="text-xs text-[#6B6B6B] font-semibold leading-relaxed">
            All workspace settings and planner datasets are saved exclusively in your browser sandbox (localStorage). No data leaks or analytics triggers exist.
          </p>
        </div>

      </div>
    </div>
  );
}
