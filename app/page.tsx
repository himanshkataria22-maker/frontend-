"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isSameDay,
  getDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================
   TYPES
========================================= */
type Category = "content" | "social" | "meeting" | "deadline" | "idea" | "other";

interface NoteData {
  text: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

type NotesMap = Record<string, NoteData>;

/* =========================================
   CONSTANTS
========================================= */
const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: "content", label: "Content", emoji: "📝", color: "#22d3ee" },
  { value: "social", label: "Social", emoji: "📱", color: "#f472b6" },
  { value: "meeting", label: "Meeting", emoji: "🤝", color: "#facc15" },
  { value: "deadline", label: "Deadline", emoji: "⏰", color: "#ef4444" },
  { value: "idea", label: "Idea", emoji: "💡", color: "#a78bfa" },
  { value: "other", label: "Other", emoji: "📌", color: "#94a3b8" },
];

const AI_SUGGESTIONS = [
  "Draft blog post on industry trends",
  "Schedule social media content",
  "Review Q2 content performance",
  "Create infographic for campaign",
  "Plan interview with thought leader",
  "Update SEO strategy document",
  "Prepare newsletter for next week",
  "Brainstorm video content ideas",
  "Analyze competitor content strategy",
  "Write case study for client",
  "Design email marketing template",
  "Schedule team content sync",
  "Research trending hashtags",
  "Outline whitepaper draft",
  "Update content calendar for next month",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* =========================================
   FLOATING PARTICLES COMPONENT
========================================= */
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================
   AURORA BACKGROUND
========================================= */
function AuroraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}

/* =========================================
   STAT CARD
========================================= */
function StatCard({ value, label, gradient, icon }: {
  value: string | number;
  label: string;
  gradient: string;
  icon: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`stat-card glass-card rounded-2xl p-5 text-center relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <div className="relative z-10">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-gray-400 text-sm">{label}</div>
      </div>
    </motion.div>
  );
}

/* =========================================
   KEYBOARD SHORTCUT BADGE
========================================= */
function KbdBadge({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-md">
      {children}
    </kbd>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */
export default function Home() {
  const [notes, setNotes] = useState<NotesMap>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noteText, setNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState<Category>("content");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calendar computation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const allDays = useMemo(() => 
    eachDayOfInterval({ start: calStart, end: calEnd }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calStart.getTime(), calEnd.getTime()]
  );

  // This week's days
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = useMemo(() => 
    eachDayOfInterval({ start: weekStart, end: weekEnd }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.getTime(), weekEnd.getTime()]
  );

  const displayDays = viewMode === "month" ? allDays : weekDays;

  // Load saved notes
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("editorial-notes-v2");
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load notes:", e);
    }
  }, []);

  // Save notes
  useEffect(() => {
    if (mounted && Object.keys(notes).length >= 0) {
      localStorage.setItem("editorial-notes-v2", JSON.stringify(notes));
    }
  }, [notes, mounted]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedDate(null);
      setShowAISuggestions(false);
      setShowShortcuts(false);
      setShowExport(false);
    }
    if (e.key === "?" && !selectedDate) {
      e.preventDefault();
      setShowShortcuts(prev => !prev);
    }
    if (e.key === "n" && !selectedDate && !showShortcuts) {
      e.preventDefault();
      openNote(today);
    }
    if (e.key === "ArrowLeft" && !selectedDate) {
      e.preventDefault();
      setCurrentMonth(prev => subMonths(prev, 1));
    }
    if (e.key === "ArrowRight" && !selectedDate) {
      e.preventDefault();
      setCurrentMonth(prev => addMonths(prev, 1));
    }
  }, [selectedDate, showShortcuts]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Note handlers
  const saveNote = () => {
    if (selectedDate && noteText.trim()) {
      const key = format(selectedDate, "yyyy-MM-dd");
      const now = new Date().toISOString();
      setNotes(prev => ({
        ...prev,
        [key]: {
          text: noteText.trim(),
          category: noteCategory,
          createdAt: prev[key]?.createdAt || now,
          updatedAt: now,
        },
      }));
      setNoteText("");
      setSelectedDate(null);
    }
  };

  const deleteNote = () => {
    if (selectedDate) {
      const key = format(selectedDate, "yyyy-MM-dd");
      setNotes(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setNoteText("");
      setSelectedDate(null);
    }
  };

  const openNote = (day: Date) => {
    setSelectedDate(day);
    const key = format(day, "yyyy-MM-dd");
    const existing = notes[key];
    setNoteText(existing?.text || "");
    setNoteCategory(existing?.category || "content");
    setShowAISuggestions(false);
  };

  const applySuggestion = (text: string) => {
    setNoteText(prev => prev ? `${prev}\n${text}` : text);
    setShowAISuggestions(false);
    textareaRef.current?.focus();
  };

  // Export
  const exportNotes = (exportFormat: "json" | "csv" | "md") => {
    let content = "";
    let filename = "";
    let mimeType = "";

    const sortedKeys = Object.keys(notes).sort();

    if (exportFormat === "json") {
      content = JSON.stringify(notes, null, 2);
      filename = "editorial-calendar-notes.json";
      mimeType = "application/json";
    } else if (exportFormat === "csv") {
      content = "Date,Category,Note,Created,Updated\n";
      sortedKeys.forEach(key => {
        const n = notes[key];
        content += `"${key}","${n.category}","${n.text.replace(/"/g, '""')}","${n.createdAt}","${n.updatedAt}"\n`;
      });
      filename = "editorial-calendar-notes.csv";
      mimeType = "text/csv";
    } else {
      content = "# Editorial Calendar Notes\n\n";
      sortedKeys.forEach(key => {
        const n = notes[key];
        const cat = CATEGORIES.find(c => c.value === n.category);
        content += `## ${key} ${cat?.emoji || ""} ${cat?.label || ""}\n\n${n.text}\n\n---\n\n`;
      });
      filename = "editorial-calendar-notes.md";
      mimeType = "text/markdown";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  // Filter logic
  const getVisibleNote = (key: string): NoteData | undefined => {
    const note = notes[key];
    if (!note) return undefined;
    if (filterCategory !== "all" && note.category !== filterCategory) return undefined;
    if (search && !note.text.toLowerCase().includes(search.toLowerCase())) return undefined;
    return note;
  };

  // Stats
  const totalNotes = Object.keys(notes).length;
  const thisMonthNotes = Object.keys(notes).filter(key =>
    isSameMonth(new Date(key + "T00:00:00"), currentMonth)
  ).length;
  const todayHasNote = notes[format(today, "yyyy-MM-dd")] !== undefined;
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = { content: 0, social: 0, meeting: 0, deadline: 0, idea: 0, other: 0 };
    Object.values(notes).forEach(n => counts[n.category]++);
    return counts;
  }, [notes]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative">
      {/* BACKGROUNDS */}
      <AuroraBackground />
      <FloatingParticles />
      <div className="noise-overlay" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* =========== HEADER =========== */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8 md:mb-10"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold gradient-text mb-3 tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Editorial Calendar
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-base md:text-lg tracking-wide"
            >
              Plan smarter · Create faster · Ship content on time
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            />
          </motion.div>

          {/* =========== TOP CONTROLS =========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between"
          >
            {/* Left: Month nav + View toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center glass-card rounded-xl overflow-hidden">
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="px-4 py-2.5 text-sm font-medium transition-all hover:text-purple-300"
                >
                  ◀
                </motion.button>
                <h2 className="text-lg md:text-xl font-semibold px-4 min-w-[170px] text-center"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="px-4 py-2.5 text-sm font-medium transition-all hover:text-purple-300"
                >
                  ▶
                </motion.button>
              </div>

              {/* View Toggle */}
              <div className="flex glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2.5 text-sm font-medium transition-all ${
                    viewMode === "month"
                      ? "bg-purple-500/30 text-purple-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-2.5 text-sm font-medium transition-all ${
                    viewMode === "week"
                      ? "bg-purple-500/30 text-purple-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Week
                </button>
              </div>

              {/* Today button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentMonth(new Date());
                  setViewMode("month");
                }}
                className="px-4 py-2.5 text-sm font-medium glass-card rounded-xl text-purple-300 hover:text-white transition-all"
              >
                Today
              </motion.button>
            </div>

            {/* Right: Search + Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="glass-card rounded-xl overflow-hidden">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
                  className="bg-transparent px-3 py-2.5 text-sm text-gray-300 cursor-pointer appearance-none pr-8"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="all" className="bg-gray-900">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-gray-900">
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-10 py-2.5 w-48 md:w-64 glass-card rounded-xl text-sm placeholder-gray-500 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Export */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExport(true)}
                className="px-4 py-2.5 text-sm glass-card rounded-xl text-gray-400 hover:text-white transition-all"
                title="Export notes"
              >
                📤
              </motion.button>

              {/* Shortcuts */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShortcuts(true)}
                className="px-4 py-2.5 text-sm glass-card rounded-xl text-gray-400 hover:text-white transition-all"
                title="Keyboard shortcuts"
              >
                ⌨️
              </motion.button>
            </div>
          </motion.div>

          {/* =========== CALENDAR =========== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card rounded-3xl p-4 md:p-6 mb-8"
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-3 mb-3">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm text-purple-400/70 font-semibold py-2 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-3">
              {viewMode === "week" && (
                <>
                  {/* Pad start of week row if needed */}
                  {Array.from({ length: getDay(weekDays[0]) }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                </>
              )}
              {displayDays.map((day, i) => {
                const key = format(day, "yyyy-MM-dd");
                const note = getVisibleNote(key);
                const rawNote = notes[key];
                const isCurrentMonth = viewMode === "week" || isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const category = rawNote ? CATEGORIES.find(c => c.value === rawNote.category) : null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.012, duration: 0.3, ease: "easeOut" }}
                    whileHover={isCurrentMonth ? { 
                      scale: 1.04, 
                      y: -3,
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={isCurrentMonth ? { scale: 0.97 } : {}}
                    onClick={() => isCurrentMonth && openNote(day)}
                    className={`
                      relative rounded-2xl cursor-pointer transition-all duration-300
                      min-h-[72px] md:min-h-[100px] p-2.5 md:p-3.5
                      ${isCurrentMonth
                        ? "glass-card glass-card-hover"
                        : "bg-white/[0.02] border border-white/[0.03] opacity-30 cursor-default"
                      }
                      ${isTodayDate ? "today-ring" : ""}
                    `}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs md:text-sm font-bold ${
                        isTodayDate
                          ? "text-purple-400"
                          : isCurrentMonth
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}>
                        {format(day, "d")}
                      </span>
                      {isTodayDate && (
                        <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-medium hidden md:inline">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Note Preview */}
                    {note && isCurrentMonth && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1"
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <div
                            className={`note-dot category-dot-${note.category}`}
                            style={{ color: category?.color }}
                          />
                          <span className={`text-[10px] font-medium category-${note.category}`}>
                            {category?.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                          {note.text}
                        </div>
                      </motion.div>
                    )}

                    {/* Hidden note indicator (when filtered) */}
                    {!note && rawNote && isCurrentMonth && (
                      <div className="absolute bottom-2 right-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* =========== STATS =========== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8"
          >
            <StatCard
              value={totalNotes}
              label="Total Notes"
              gradient="from-purple-500/20 to-violet-500/20"
              icon="📊"
            />
            <StatCard
              value={thisMonthNotes}
              label="This Month"
              gradient="from-blue-500/20 to-cyan-500/20"
              icon="📅"
            />
            <StatCard
              value={todayHasNote ? "✓" : "—"}
              label="Today"
              gradient="from-green-500/20 to-emerald-500/20"
              icon={todayHasNote ? "✅" : "📝"}
            />
            <StatCard
              value={Object.keys(categoryCounts).reduce((top, k) => 
                categoryCounts[k as Category] > (categoryCounts[top as Category] || 0) ? k : top, "content"
              ).charAt(0).toUpperCase() + Object.keys(categoryCounts).reduce((top, k) => 
                categoryCounts[k as Category] > (categoryCounts[top as Category] || 0) ? k : top, "content"
              ).slice(1)}
              label="Top Category"
              gradient="from-pink-500/20 to-rose-500/20"
              icon={CATEGORIES.find(c => c.value === Object.keys(categoryCounts).reduce((top, k) => 
                categoryCounts[k as Category] > (categoryCounts[top as Category] || 0) ? k : top, "content"
              ))?.emoji || "📝"}
            />
          </motion.div>

          {/* =========== CATEGORY BREAKDOWN =========== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-5 md:p-6 mb-8"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Category Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterCategory(filterCategory === cat.value ? "all" : cat.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    filterCategory === cat.value
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/[0.03] border border-transparent hover:border-white/10"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold" style={{ color: cat.color }}>
                      {categoryCounts[cat.value]}
                    </div>
                    <div className="text-[10px] text-gray-500">{cat.label}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-600 text-xs pb-6"
          >
            Press <KbdBadge>?</KbdBadge> for shortcuts · Built with Next.js + Framer Motion
          </motion.div>
        </div>
      </div>

      {/* =========== NOTE MODAL =========== */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {format(selectedDate, "EEEE")}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ✕
                  </motion.button>
                </div>
                <p className="text-sm text-gray-400">
                  {format(selectedDate, "dd MMMM yyyy")}
                </p>
              </div>

              <div className="p-6 pt-4">
                {/* Category Picker */}
                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNoteCategory(cat.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          noteCategory === cat.value
                            ? "bg-white/15 border border-white/20"
                            : "bg-white/5 border border-transparent hover:border-white/10"
                        }`}
                        style={noteCategory === cat.value ? { color: cat.color } : { color: '#9ca3af' }}
                      >
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Note Input */}
                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">
                    Note
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full p-4 bg-black/30 border border-white/10 rounded-2xl text-white text-sm h-36 resize-none transition-all leading-relaxed"
                    placeholder="What's planned for this day..."
                    autoFocus
                  />
                </div>

                {/* AI Suggestions Toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-sm text-indigo-300 hover:text-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>🤖</span>
                  {showAISuggestions ? "Hide" : "Show"} AI Suggestions
                  <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full">AI</span>
                </motion.button>

                {/* AI Suggestions */}
                <AnimatePresence>
                  {showAISuggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="p-3 rounded-xl bg-black/20 border border-white/5 max-h-40 overflow-y-auto">
                        <div className="grid gap-1.5">
                          {AI_SUGGESTIONS.sort(() => Math.random() - 0.5).slice(0, 6).map((suggestion, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ x: 4 }}
                              onClick={() => applySuggestion(suggestion)}
                              className="text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-2"
                            >
                              <span className="text-purple-400">+</span>
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveNote}
                    disabled={!noteText.trim()}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                      noteText.trim()
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    💾 Save Note
                  </motion.button>
                  {notes[format(selectedDate, "yyyy-MM-dd")] && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={deleteNote}
                      className="px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                    >
                      🗑️
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========== KEYBOARD SHORTCUTS MODAL =========== */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ⌨️ Keyboard Shortcuts
              </h2>
              <div className="space-y-3">
                {[
                  { keys: "?", desc: "Toggle this menu" },
                  { keys: "N", desc: "New note for today" },
                  { keys: "←", desc: "Previous month" },
                  { keys: "→", desc: "Next month" },
                  { keys: "Esc", desc: "Close modal" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{s.desc}</span>
                    <KbdBadge>{s.keys}</KbdBadge>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full mt-5 py-2.5 rounded-xl glass-card text-sm text-gray-400 hover:text-white transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========== EXPORT MODAL =========== */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                📤 Export Notes
              </h2>
              <p className="text-sm text-gray-400 mb-5">
                Export your {totalNotes} notes in your preferred format.
              </p>
              <div className="grid gap-3">
                {[
                  { format: "json" as const, label: "JSON", desc: "Developer-friendly", icon: "{ }" },
                  { format: "csv" as const, label: "CSV", desc: "Spreadsheet compatible", icon: "📊" },
                  { format: "md" as const, label: "Markdown", desc: "Human readable", icon: "📄" },
                ].map((opt) => (
                  <motion.button
                    key={opt.format}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportNotes(opt.format)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-left"
                  >
                    <span className="text-xl w-8 text-center">{opt.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setShowExport(false)}
                className="w-full mt-5 py-2.5 rounded-xl glass-card text-sm text-gray-400 hover:text-white transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========== FAB - Quick Add =========== */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openNote(today)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl shadow-2xl shadow-purple-500/30 z-40 hover:shadow-purple-500/50 transition-shadow"
        title="Quick add note for today"
      >
        <motion.span
          animate={{ rotate: [0, 0, 180, 180, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          +
        </motion.span>
      </motion.button>
    </div>
  );
}
