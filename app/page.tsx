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
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.25 + 0.08,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
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
function StatCard({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2 }}
      className="stat-card glass-card"
    >
      <div className="stat-card-inner">
        <div className="stat-icon">{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
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

  const allDays = useMemo(
    () => eachDayOfInterval({ start: calStart, end: calEnd }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calStart.getTime(), calEnd.getTime()]
  );

  // This week's days
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
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
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDate(null);
        setShowAISuggestions(false);
        setShowShortcuts(false);
        setShowExport(false);
      }
      if (e.key === "?" && !selectedDate) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (e.key === "n" && !selectedDate && !showShortcuts) {
        e.preventDefault();
        openNote(today);
      }
      if (e.key === "ArrowLeft" && !selectedDate) {
        e.preventDefault();
        setCurrentMonth((prev) => subMonths(prev, 1));
      }
      if (e.key === "ArrowRight" && !selectedDate) {
        e.preventDefault();
        setCurrentMonth((prev) => addMonths(prev, 1));
      }
    },
    [selectedDate, showShortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Note handlers
  const saveNote = () => {
    if (selectedDate && noteText.trim()) {
      const key = format(selectedDate, "yyyy-MM-dd");
      const now = new Date().toISOString();
      setNotes((prev) => ({
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
      setNotes((prev) => {
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
    setNoteText((prev) => (prev ? `${prev}\n${text}` : text));
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
      sortedKeys.forEach((key) => {
        const n = notes[key];
        content += `"${key}","${n.category}","${n.text.replace(/"/g, '""')}","${n.createdAt}","${n.updatedAt}"\n`;
      });
      filename = "editorial-calendar-notes.csv";
      mimeType = "text/csv";
    } else {
      content = "# Editorial Calendar Notes\n\n";
      sortedKeys.forEach((key) => {
        const n = notes[key];
        const cat = CATEGORIES.find((c) => c.value === n.category);
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
  const thisMonthNotes = Object.keys(notes).filter((key) =>
    isSameMonth(new Date(key + "T00:00:00"), currentMonth)
  ).length;
  const todayHasNote = notes[format(today, "yyyy-MM-dd")] !== undefined;
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      content: 0,
      social: 0,
      meeting: 0,
      deadline: 0,
      idea: 0,
      other: 0,
    };
    Object.values(notes).forEach((n) => counts[n.category]++);
    return counts;
  }, [notes]);

  const topCategory = useMemo(() => {
    return Object.keys(categoryCounts).reduce((top, k) =>
      categoryCounts[k as Category] > (categoryCounts[top as Category] || 0) ? k : top,
      "content"
    );
  }, [categoryCounts]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* BACKGROUNDS */}
      <AuroraBackground />
      <FloatingParticles />
      <div className="noise-overlay" />

      {/* MAIN CONTENT */}
      <div className="app-container">
        <div className="app-inner">
          {/* =========== HEADER =========== */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="header-section"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <h1 className="header-title gradient-text">
                AI Editorial Calendar
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="header-subtitle"
            >
              Plan smarter · Create faster · Ship content on time
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="header-divider"
            />
          </motion.div>

          {/* =========== TOP CONTROLS =========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="controls-bar"
          >
            {/* Left controls */}
            <div className="controls-group">
              {/* Month Navigator */}
              <div className="month-nav glass-card">
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="month-nav-btn"
                >
                  ◀
                </motion.button>
                <h2 className="month-nav-title">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="month-nav-btn"
                >
                  ▶
                </motion.button>
              </div>

              {/* View Toggle */}
              <div className="view-toggle glass-card">
                <button
                  onClick={() => setViewMode("month")}
                  className={`view-toggle-btn ${viewMode === "month" ? "active" : ""}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`view-toggle-btn ${viewMode === "week" ? "active" : ""}`}
                >
                  Week
                </button>
              </div>

              {/* Today */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentMonth(new Date());
                  setViewMode("month");
                }}
                className="action-btn glass-card"
              >
                Today
              </motion.button>
            </div>

            {/* Right controls */}
            <div className="controls-group">
              {/* Category Filter */}
              <div className="category-filter glass-card">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="search-wrapper glass-card" style={{ borderRadius: 14 }}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="search-clear">
                    ✕
                  </button>
                )}
              </div>

              {/* Export */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExport(true)}
                className="icon-btn glass-card"
                title="Export notes"
                style={{ borderRadius: 14 }}
              >
                📤
              </motion.button>

              {/* Shortcuts */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShortcuts(true)}
                className="icon-btn glass-card"
                title="Keyboard shortcuts"
                style={{ borderRadius: 14 }}
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
            className="calendar-container glass-card"
          >
            {/* Day Headers */}
            <div className="day-headers">
              {DAY_NAMES.map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {viewMode === "week" &&
                Array.from({ length: getDay(weekDays[0]) }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
              {displayDays.map((day, i) => {
                const key = format(day, "yyyy-MM-dd");
                const note = getVisibleNote(key);
                const rawNote = notes[key];
                const isCurrentMonth =
                  viewMode === "week" || isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const category = rawNote
                  ? CATEGORIES.find((c) => c.value === rawNote.category)
                  : null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: i * 0.01,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    whileHover={
                      isCurrentMonth
                        ? { scale: 1.04, y: -3, transition: { duration: 0.2 } }
                        : {}
                    }
                    whileTap={isCurrentMonth ? { scale: 0.97 } : {}}
                    onClick={() => isCurrentMonth && openNote(day)}
                    className={`day-cell ${
                      isCurrentMonth
                        ? "glass-card glass-card-hover current-month"
                        : "other-month"
                    } ${isTodayDate ? "today-ring" : ""}`}
                  >
                    {/* Day Number */}
                    <div className="day-cell-header">
                      <span
                        className={`day-number ${
                          isTodayDate
                            ? "today"
                            : isCurrentMonth
                            ? ""
                            : "dimmed"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {isTodayDate && (
                        <span className="today-badge">TODAY</span>
                      )}
                    </div>

                    {/* Note Preview */}
                    {note && isCurrentMonth && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="note-preview"
                      >
                        <div className="note-preview-header">
                          <div
                            className={`note-dot category-dot-${note.category}`}
                            style={{ color: category?.color }}
                          />
                          <span
                            className={`note-preview-label category-${note.category}`}
                          >
                            {category?.label}
                          </span>
                        </div>
                        <div className="note-preview-text">{note.text}</div>
                      </motion.div>
                    )}

                    {/* Hidden note indicator */}
                    {!note && rawNote && isCurrentMonth && (
                      <div className="hidden-note-dot" />
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
            className="stats-grid"
          >
            <StatCard value={totalNotes} label="Total Notes" icon="📊" />
            <StatCard value={thisMonthNotes} label="This Month" icon="📅" />
            <StatCard
              value={todayHasNote ? "✓" : "—"}
              label="Today"
              icon={todayHasNote ? "✅" : "📝"}
            />
            <StatCard
              value={topCategory.charAt(0).toUpperCase() + topCategory.slice(1)}
              label="Top Category"
              icon={
                CATEGORIES.find((c) => c.value === topCategory)?.emoji || "📝"
              }
            />
          </motion.div>

          {/* =========== CATEGORY BREAKDOWN =========== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="category-section glass-card"
          >
            <h3 className="category-title">Category Breakdown</h3>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setFilterCategory(
                      filterCategory === cat.value ? "all" : cat.value
                    )
                  }
                  className={`category-chip ${
                    filterCategory === cat.value ? "active" : ""
                  }`}
                >
                  <span className="category-chip-emoji">{cat.emoji}</span>
                  <div style={{ textAlign: "left" }}>
                    <div
                      className="category-chip-count"
                      style={{ color: cat.color }}
                    >
                      {categoryCounts[cat.value]}
                    </div>
                    <div className="category-chip-label">{cat.label}</div>
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
            className="app-footer"
          >
            Press{" "}
            <span className="shortcut-key" style={{ display: "inline-flex" }}>
              ?
            </span>{" "}
            for shortcuts · Built with Next.js + Framer Motion
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
            className="modal-backdrop"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-card glass-card"
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-header-top">
                  <h2 className="modal-title">
                    {format(selectedDate, "EEEE")}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(null)}
                    className="modal-close-btn"
                  >
                    ✕
                  </motion.button>
                </div>
                <p className="modal-date">
                  {format(selectedDate, "dd MMMM yyyy")}
                </p>
              </div>

              <div className="modal-body">
                {/* Category Picker */}
                <div>
                  <label className="modal-label">Category</label>
                  <div className="category-picker">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNoteCategory(cat.value)}
                        className={`category-pick-btn ${
                          noteCategory === cat.value ? "active" : ""
                        }`}
                        style={
                          noteCategory === cat.value
                            ? { color: cat.color }
                            : {}
                        }
                      >
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Note Input */}
                <div>
                  <label className="modal-label">Note</label>
                  <textarea
                    ref={textareaRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="note-textarea"
                    placeholder="What's planned for this day..."
                    autoFocus
                  />
                </div>

                {/* AI Suggestions Toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="ai-suggest-btn"
                >
                  <span>🤖</span>
                  {showAISuggestions ? "Hide" : "Show"} AI Suggestions
                  <span className="ai-badge">AI</span>
                </motion.button>

                {/* AI Suggestions */}
                <AnimatePresence>
                  {showAISuggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="ai-suggestions-panel">
                        <div style={{ display: "grid", gap: 4 }}>
                          {AI_SUGGESTIONS.sort(() => Math.random() - 0.5)
                            .slice(0, 6)
                            .map((suggestion, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ x: 4 }}
                                onClick={() => applySuggestion(suggestion)}
                                className="ai-suggestion-item"
                              >
                                <span className="ai-suggestion-plus">+</span>
                                {suggestion}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveNote}
                    disabled={!noteText.trim()}
                    className={`save-btn ${
                      noteText.trim() ? "enabled" : "disabled"
                    }`}
                  >
                    💾 Save Note
                  </motion.button>
                  {notes[format(selectedDate, "yyyy-MM-dd")] && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={deleteNote}
                      className="delete-btn"
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
            className="modal-backdrop"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="small-modal glass-card"
            >
              <h2 className="small-modal-title">⌨️ Keyboard Shortcuts</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { keys: "?", desc: "Toggle this menu" },
                  { keys: "N", desc: "New note for today" },
                  { keys: "←", desc: "Previous month" },
                  { keys: "→", desc: "Next month" },
                  { keys: "Esc", desc: "Close modal" },
                ].map((s) => (
                  <div key={s.keys} className="shortcut-row">
                    <span className="shortcut-desc">{s.desc}</span>
                    <span className="shortcut-key">{s.keys}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="modal-close-full glass-card"
                style={{ borderRadius: 14 }}
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
            className="modal-backdrop"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="small-modal glass-card"
            >
              <h2 className="small-modal-title">📤 Export Notes</h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  marginBottom: 20,
                }}
              >
                Export your {totalNotes} notes in your preferred format.
              </p>
              <div>
                {[
                  {
                    format: "json" as const,
                    label: "JSON",
                    desc: "Developer-friendly",
                    icon: "{ }",
                  },
                  {
                    format: "csv" as const,
                    label: "CSV",
                    desc: "Spreadsheet compatible",
                    icon: "📊",
                  },
                  {
                    format: "md" as const,
                    label: "Markdown",
                    desc: "Human readable",
                    icon: "📄",
                  },
                ].map((opt) => (
                  <motion.button
                    key={opt.format}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportNotes(opt.format)}
                    className="export-option"
                  >
                    <span className="export-icon">{opt.icon}</span>
                    <div>
                      <div className="export-label">{opt.label}</div>
                      <div className="export-desc">{opt.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setShowExport(false)}
                className="modal-close-full glass-card"
                style={{ borderRadius: 14 }}
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
        className="fab"
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
