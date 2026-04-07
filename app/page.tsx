"use client";
import { useState, useEffect } from "react";
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
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noteText, setNoteText] = useState("");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Load saved notes
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes:", e);
      }
    }
  }, []);

  // Save notes
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes]);

  const saveNote = () => {
    if (selectedDate && noteText.trim()) {
      setNotes({
        ...notes,
        [format(selectedDate, "yyyy-MM-dd")]: noteText.trim(),
      });
      setNoteText("");
      setSelectedDate(null);
    }
  };

  const deleteNote = () => {
    if (selectedDate) {
      const newNotes = { ...notes };
      delete newNotes[format(selectedDate, "yyyy-MM-dd")];
      setNotes(newNotes);
      setNoteText("");
      setSelectedDate(null);
    }
  };

  const openNote = (day: Date) => {
    setSelectedDate(day);
    const key = format(day, "yyyy-MM-dd");
    setNoteText(notes[key] || "");
  };

  const filteredDays = days.filter((day) => {
    if (!search) return true;
    const key = format(day, "yyyy-MM-dd");
    const note = notes[key];
    return note && note.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            ✨ AI Editorial Calendar
          </h1>
          <p className="text-gray-400 text-lg">Plan smarter. Work faster.</p>
        </motion.div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              ← Prev
            </motion.button>
            <h2 className="text-2xl font-semibold min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              Next →
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-purple-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* CALENDAR */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm md:text-base text-purple-300 font-bold py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {days.map((day, i) => {
              const key = format(day, "yyyy-MM-dd");
              const note = notes[key];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const isFiltered = search && !filteredDays.includes(day);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  whileHover={isCurrentMonth ? { scale: 1.05, y: -5 } : {}}
                  whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
                  onClick={() => isCurrentMonth && openNote(day)}
                  className={`
                    relative p-3 md:p-4 rounded-2xl cursor-pointer transition-all min-h-[80px] md:min-h-[100px]
                    ${
                      isCurrentMonth
                        ? "bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30"
                        : "bg-white/5 border border-white/5 opacity-40"
                    }
                    ${isTodayDate ? "ring-2 ring-purple-500" : ""}
                    ${isFiltered ? "opacity-20" : ""}
                  `}
                >
                  <div
                    className={`text-sm md:text-base font-semibold ${
                      isTodayDate
                        ? "text-purple-400"
                        : isCurrentMonth
                        ? "text-gray-200"
                        : "text-gray-600"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {note && isCurrentMonth && (
                    <div className="mt-2">
                      <div className="text-xs text-green-400 mb-1">📝</div>
                      <div className="text-xs text-gray-300 line-clamp-2">
                        {note}
                      </div>
                    </div>
                  )}
                  {isTodayDate && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Object.keys(notes).length}
            </div>
            <div className="text-gray-400 mt-1">Total Notes</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {
                Object.keys(notes).filter((key) =>
                  isSameMonth(new Date(key), currentMonth)
                ).length
              }
            </div>
            <div className="text-gray-400 mt-1">This Month</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">
              {search && filteredDays.length}
              {!search && "🔍"}
            </div>
            <div className="text-gray-400 mt-1">
              {search ? "Search Results" : "Search Active"}
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-lg border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-400">
                  {format(selectedDate, "EEEE, dd MMMM yyyy")}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white h-40 focus:outline-none focus:border-purple-400 transition-all resize-none"
                placeholder="Write your note here..."
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveNote}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                >
                  💾 Save Note
                </motion.button>
                {notes[format(selectedDate, "yyyy-MM-dd")] && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={deleteNote}
                    className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-xl font-semibold hover:bg-red-500/30 transition-all"
                  >
                    🗑️
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
