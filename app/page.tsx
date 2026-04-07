"use client";
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
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
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const saveNote = (text: string) => {
    if (selectedDate) {
      setNotes({
        ...notes,
        [format(selectedDate, "yyyy-MM-dd")]: text,
      });
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl font-bold tracking-wide">🚀 AI Smart Calendar</h1>
        <p className="text-gray-400 text-sm">Plan smarter. Work faster.</p>
      </motion.div>

      {/* SEARCH */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none"
        />
      </div>

      {/* CALENDAR */}
      <div className="max-w-6xl mx-auto">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-4 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-400 font-semibold">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-4">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const note = notes[key];
          
          if (search && (!note || !note.toLowerCase().includes(search.toLowerCase()))) {
            return (
              <motion.div
                key={i}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 opacity-30"
              >
                <div className="text-sm text-gray-500">{format(day, "dd")}</div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(day)}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 cursor-pointer shadow-lg hover:shadow-purple-500/20 transition-all glow"
            >
              <div className="text-sm text-gray-300">{format(day, "dd")}</div>
              {note && (
                <div className="mt-2 text-xs text-green-400">
                  📝 {note.slice(0, 15)}...
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      </div>

      {/* MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 p-6 rounded-xl w-80 border border-white/20"
          >
            <h2 className="text-lg mb-3">
              Add Note ({format(selectedDate, "dd MMM yyyy")})
            </h2>
            <textarea
              id="noteInput"
              defaultValue={notes[format(selectedDate, "yyyy-MM-dd")] || ""}
              className="w-full p-2 bg-black border border-gray-600 rounded mb-3 text-white h-24"
              placeholder="Write something..."
            />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  saveNote(
                    (document.getElementById("noteInput") as HTMLTextAreaElement)
                      .value
                  )
                }
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 py-2 rounded-lg hover:opacity-90"
              >
                Save Note
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
