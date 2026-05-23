"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Map as MapIcon,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Award
} from "lucide-react";

interface RoadmapNode {
  id: string;
  label: string;
  phase: "Foundation" | "Growth" | "Ascent";
  completed: boolean;
  x: number; // coordinate percent
  y: number; // coordinate percent
}

export default function MapPage() {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodePhase, setNewNodePhase] = useState<"Foundation" | "Growth" | "Ascent">("Foundation");

  // Load / Save Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_roadmap_nodes");
      if (stored) {
        try {
          setNodes(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Sample default nodes
        const defaultNodes: RoadmapNode[] = [
          { id: "1", label: "Establish Core 3 Limit Rules", phase: "Foundation", completed: true, x: 15, y: 30 },
          { id: "2", label: "Synthesize Low-pass Focus Sound Engine", phase: "Foundation", completed: true, x: 30, y: 70 },
          { id: "3", label: "Construct Native Route Groups App Layouts", phase: "Growth", completed: false, x: 50, y: 30 },
          { id: "4", label: "Deploy Collaborative Coworking Dashboard", phase: "Growth", completed: false, x: 65, y: 70 },
          { id: "5", label: "Achieve Mental Flow & Cognitive Calm", phase: "Ascent", completed: false, x: 85, y: 50 }
        ];
        setNodes(defaultNodes);
        localStorage.setItem("spacenos_roadmap_nodes", JSON.stringify(defaultNodes));
      }
    }
  }, []);

  const saveNodes = (updated: RoadmapNode[]) => {
    setNodes(updated);
    localStorage.setItem("spacenos_roadmap_nodes", JSON.stringify(updated));
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    // Calculate dynamic position based on phase
    let phaseX = 20;
    if (newNodePhase === "Growth") phaseX = 55;
    if (newNodePhase === "Ascent") phaseX = 85;

    const randomY = 25 + Math.random() * 50; // scatter around center

    const newNode: RoadmapNode = {
      id: Date.now().toString(),
      label: newNodeLabel.trim(),
      phase: newNodePhase,
      completed: false,
      x: phaseX + (Math.random() * 8 - 4),
      y: randomY
    };

    const updated = [...nodes, newNode];
    saveNodes(updated);
    setNewNodeLabel("");
  };

  const toggleNode = (id: string) => {
    const updated = nodes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n));
    saveNodes(updated);
  };

  const deleteNode = (id: string) => {
    const updated = nodes.filter((n) => n.id !== id);
    saveNodes(updated);
  };

  // Sort nodes by X coordinate to draw cleaner connector lines
  const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <MapIcon className="w-3.5 h-3.5 text-primary" /> Visual Strategy
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            Goal Roadmap
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            A spatial chart mapping goals into sequential horizons. See pathways, block clutter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Interactive Roadmap Board Canvas */}
        <div className="lg:col-span-3 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 shadow-xs flex flex-col min-h-[480px] relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 z-10 shrink-0">
            <h3 className="font-display text-sm font-semibold text-black">
              Milestone Pathway
            </h3>
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-[#FCEBE6] px-2 py-0.5 rounded">
              interactive nodes
            </span>
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 border border-dotted border-[rgba(0,0,0,0.1)] bg-[#FCFAF8] rounded-xl relative min-h-[350px]">
            {/* SVG Connector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {sortedNodes.map((node, index) => {
                if (index === 0) return null;
                const prev = sortedNodes[index - 1];
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={`${prev.x}%`}
                    y1={`${prev.y}%`}
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke={node.completed && prev.completed ? "#E14C2A" : "rgba(0, 0, 0, 0.08)"}
                    strokeWidth={node.completed && prev.completed ? "3" : "1.5"}
                    strokeDasharray={node.completed && prev.completed ? "none" : "5, 5"}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Phase Divider Markings */}
            <div className="absolute inset-0 flex select-none pointer-events-none z-0">
              <div className="flex-1 border-r border-dashed border-[rgba(0,0,0,0.04)] flex items-end justify-start p-4">
                <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest">I. Foundation</span>
              </div>
              <div className="flex-1 border-r border-dashed border-[rgba(0,0,0,0.04)] flex items-end justify-start p-4">
                <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest">II. Growth</span>
              </div>
              <div className="flex-1 flex items-end justify-start p-4">
                <span className="text-[8px] font-bold text-[#6B6B6B] uppercase tracking-widest">III. Ascent</span>
              </div>
            </div>

            {/* Floating Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                className="absolute z-10 transition-all"
              >
                <div
                  onClick={() => toggleNode(node.id)}
                  className={`px-3 py-2 rounded-xl border-2 shadow-sm cursor-pointer select-none text-[10px] font-bold flex items-center gap-2 max-w-[140px] text-center justify-center transition-all ${
                    node.completed
                      ? "bg-[#FCEBE6] border-[#E14C2A] text-black"
                      : "bg-white border-[rgba(0,0,0,0.06)] hover:border-primary text-[#6B6B6B]"
                  }`}
                >
                  <button className="shrink-0">
                    {node.completed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/10" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#6B6B6B]/40" />
                    )}
                  </button>
                  <span className="truncate">{node.label}</span>
                </div>

                {/* Micro Trash button */}
                <button
                  onClick={() => deleteNode(node.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-[rgba(0,0,0,0.06)] shadow-xs opacity-0 hover:opacity-100 transition-opacity text-[#6B6B6B] hover:text-primary z-20"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[10px] text-[#6B6B6B] font-semibold leading-relaxed shrink-0">
            Click nodes to trigger completion pathways. Active roadmap paths highlight with full Terracotta values when completed.
          </div>
        </div>

        {/* Right Side: Nodes creation form panel */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-2xl shadow-xs space-y-6">
          <div>
            <h3 className="font-display text-sm font-semibold text-black mb-4">
              Add Roadmap Node
            </h3>

            <form onSubmit={handleAddNode} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Milestone Title
                </label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g. Gather feedback"
                  className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
                  Horizon Phase
                </label>
                <select
                  value={newNodePhase}
                  onChange={(e) => setNewNodePhase(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="Foundation">Foundation (Horizon 1)</option>
                  <option value="Growth">Growth (Horizon 2)</option>
                  <option value="Ascent">Ascent (Horizon 3)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E14C2A] hover:brightness-110 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Append Milestone</span>
              </button>
            </form>
          </div>

          <div className="p-4 rounded-xl bg-[#FCFAF8] border border-[rgba(0,0,0,0.06)] space-y-2">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Progress Metrics
            </h4>
            <div className="text-xs space-y-1 font-semibold text-black">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Total Nodes:</span>
                <span>{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Completed:</span>
                <span>{nodes.filter((n) => n.completed).length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
