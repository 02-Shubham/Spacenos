"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  FolderOpen,
  Eye,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Save,
  Grid
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  stationery: "lined" | "grid" | "blank";
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spacenos_notes");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotes(parsed);
          if (parsed.length > 0) {
            setSelectedNoteId(parsed[0].id);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Sample seed notes
        const defaultNotes: Note[] = [
          {
            id: "1",
            title: "Executive Clarity Guide",
            content: "1. Only list 3 things per day.\n2. Dedicate blocks of quiet time for high dopamine outputs.\n3. Pause browser notification badges.",
            category: "Work",
            stationery: "lined",
            updatedAt: new Date().toLocaleDateString()
          },
          {
            id: "2",
            title: "Sensory Sanctuary Ideas",
            content: "- Low brown frequencies (320Hz lowpass filter)\n- Warm amber accent systems\n- Matte physical books",
            category: "Personal",
            stationery: "grid",
            updatedAt: new Date().toLocaleDateString()
          }
        ];
        setNotes(defaultNotes);
        setSelectedNoteId("1");
        localStorage.setItem("spacenos_notes", JSON.stringify(defaultNotes));
      }
    }
  }, []);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem("spacenos_notes", JSON.stringify(updated));
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      category: filterCategory === "All" ? "Work" : filterCategory,
      stationery: "lined",
      updatedAt: new Date().toLocaleDateString()
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);

    if (selectedNoteId === id) {
      if (updated.length > 0) {
        setSelectedNoteId(updated[0].id);
      } else {
        setSelectedNoteId("");
      }
    }
  };

  const updateSelectedNote = (field: keyof Note, value: any) => {
    const updated = notes.map((note) => {
      if (note.id === selectedNoteId) {
        return {
          ...note,
          [field]: value,
          updatedAt: new Date().toLocaleDateString()
        };
      }
      return note;
    });
    saveNotes(updated);
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "All" || note.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const getStationeryClass = (type: "lined" | "grid" | "blank") => {
    if (type === "lined") {
      return "bg-[linear-gradient(#f0e9df_1px,transparent_1px)] bg-[size:100%_2rem] leading-[2rem] pt-[0.25rem]";
    }
    if (type === "grid") {
      return "bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] leading-[1.5rem]";
    }
    return "bg-[#FCFAF8]";
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" /> Cognitive Journal
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#1F1F1F]">
            Stationery Editor
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            A quiet drafting interface styled like premium physical paper textures.
          </p>
        </div>

        <button
          onClick={createNote}
          className="bg-primary hover:brightness-110 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Page</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left column: Notes Directory Search and Selector List */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-4 rounded-2xl shadow-xs flex flex-col space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journals..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-[#F8F5F1] text-black border border-[rgba(0,0,0,0.04)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          {/* Folder Categories Tab controls */}
          <div className="flex gap-1 border-b border-[rgba(0,0,0,0.06)] pb-2 overflow-x-auto">
            {["All", "Work", "Personal", "Ideas"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                  filterCategory === cat
                    ? "bg-[#FCEBE6] text-primary"
                    : "text-[#6B6B6B] hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Note List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1">
            {filteredNotes.map((note) => {
              const active = note.id === selectedNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-start group ${
                    active
                      ? "bg-[#FCEBE6]/20 border-primary"
                      : "bg-[#FCFAF8] border-transparent hover:border-[rgba(0,0,0,0.08)]"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className={`text-xs font-bold truncate ${active ? "text-primary" : "text-black"}`}>
                      {note.title || <span className="italic opacity-50">Empty Title</span>}
                    </h3>
                    <p className="text-[10px] text-[#6B6B6B] truncate pr-2">
                      {note.content || <span className="italic opacity-30">Write something...</span>}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-100 text-[#6B6B6B] px-1.5 py-0.5 rounded">
                        {note.category}
                      </span>
                      <span className="text-[8px] text-[#6B6B6B]/70">{note.updatedAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6B6B6B] hover:text-primary transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center">
                <FileText className="w-8 h-8 text-[#6B6B6B] opacity-30 mb-2" />
                <p className="text-xs text-[#6B6B6B] italic">No journals located.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: The stationery paper editor */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedNote ? (
            <div className="bg-[#FCFAF8] border border-[rgba(0,0,0,0.06)] rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden min-h-[450px]">
              
              {/* Paper Top Toolbar */}
              <div className="p-4 bg-white border-b border-[rgba(0,0,0,0.06)] flex justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedNote.category}
                    onChange={(e) => updateSelectedNote("category", e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#6B6B6B] border border-transparent rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Ideas">Ideas</option>
                  </select>

                  {/* Paper type selector */}
                  <div className="flex bg-slate-100 p-0.5 rounded border border-[rgba(0,0,0,0.03)]">
                    {(["lined", "grid", "blank"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateSelectedNote("stationery", type)}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${
                          selectedNote.stationery === type
                            ? "bg-white text-primary shadow-xs"
                            : "text-[#6B6B6B] hover:text-black"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#6B6B6B] font-semibold">
                  <Save className="w-3.5 h-3.5 text-primary" /> Auto-saved local
                </div>
              </div>

              {/* Lined or Grid stationery paper content area */}
              <div className="p-6 sm:p-10 flex-1 flex flex-col overflow-y-auto">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateSelectedNote("title", e.target.value)}
                  placeholder="Page Title..."
                  className="w-full font-display text-2xl font-semibold border-b-2 border-primary/20 pb-3 mb-6 focus:outline-none focus:border-primary text-black bg-transparent"
                />

                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateSelectedNote("content", e.target.value)}
                  placeholder="Stream of consciousness..."
                  className={`w-full flex-1 resize-none focus:outline-none text-xs text-[#1F1F1F] font-sans font-medium bg-transparent ${getStationeryClass(
                    selectedNote.stationery
                  )}`}
                  style={{
                    backgroundAttachment: "local"
                  }}
                />
              </div>

            </div>
          ) : (
            <div className="bg-[#FCFAF8] border border-dashed border-[rgba(0,0,0,0.1)] rounded-2xl flex-1 flex flex-col items-center justify-center py-20 text-center">
              <FolderOpen className="w-12 h-12 text-[#6B6B6B] opacity-30 mb-3" />
              <h3 className="font-display text-lg text-black font-semibold mb-1">
                No Journal Page Selected
              </h3>
              <p className="text-xs text-[#6B6B6B] mb-6 max-w-xs">
                Select a drafting page on the left directory or write a clean new entry.
              </p>
              <button
                onClick={createNote}
                className="bg-primary hover:brightness-110 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all"
              >
                Create note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
