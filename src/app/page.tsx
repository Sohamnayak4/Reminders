'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, StickyNote, X } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ReminderType = 'deadline' | 'test' | 'other';

interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
  type: ReminderType;
  completed: boolean;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('deadline');
  
  const [noteContent, setNoteContent] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedReminders = localStorage.getItem('reminders');
    const savedNotes = localStorage.getItem('notes');
    if (savedReminders) {
        try {
            setReminders(JSON.parse(savedReminders));
        } catch (e) {
            console.error("Failed to parse reminders", e);
        }
    }
    if (savedNotes) {
        try {
             setNotes(JSON.parse(savedNotes));
        } catch (e) {
            console.error("Failed to parse notes", e);
        }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  }, [reminders, mounted]);

  useEffect(() => {
    if (mounted) {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes, mounted]);

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle || !reminderDate) return;

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: reminderTitle,
      date: reminderDate,
      type: reminderType,
      completed: false,
    };

    setReminders([...reminders, newReminder]);
    setReminderTitle('');
    setReminderDate('');
    setReminderType('deadline');
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: noteContent,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]); // Newest first
    setNoteContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  if (!mounted) {
      return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-8 font-sans selection:bg-neutral-200">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500">Manage your schedule and thoughts.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Reminders Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-800">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-medium">Reminders</h2>
              </div>
              <span className="text-sm text-neutral-400">{reminders.filter(r => !r.completed).length} remaining</span>
            </div>

            {/* Add Reminder Form */}
            <form onSubmit={addReminder} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 space-y-3 transition-all focus-within:shadow-md">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                className="w-full bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
              />
              <div className="flex flex-wrap gap-2">
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="bg-neutral-50 text-sm px-3 py-1.5 rounded-md text-neutral-600 outline-none focus:ring-1 focus:ring-neutral-200"
                />
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value as ReminderType)}
                  className="bg-neutral-50 text-sm px-3 py-1.5 rounded-md text-neutral-600 outline-none focus:ring-1 focus:ring-neutral-200 appearance-none cursor-pointer"
                >
                  <option value="deadline">Deadline</option>
                  <option value="test">Test</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="submit"
                  disabled={!reminderTitle || !reminderDate}
                  className="ml-auto bg-neutral-900 text-white p-1.5 rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-8 h-8"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Reminders List */}
            <div className="space-y-2">
              {reminders.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-sm">No reminders yet.</div>
              )}
              {reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-neutral-200 hover:bg-white transition-all",
                    reminder.completed && "opacity-50"
                  )}
                >
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                      reminder.completed ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 hover:border-neutral-400"
                    )}
                  >
                    {reminder.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate font-medium", reminder.completed && "line-through text-neutral-500")}>
                      {reminder.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                        reminder.type === 'deadline' ? "bg-red-50 text-red-600" :
                        reminder.type === 'test' ? "bg-blue-50 text-blue-600" :
                        "bg-neutral-100 text-neutral-600"
                      )}>
                        {reminder.type}
                      </span>
                      <span>{format(new Date(reminder.date), 'MMM d, h:mm a')}</span>
                    </div>
        </div>

                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-neutral-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Notes Section */}
          <section className="space-y-6">
             <div className="flex items-center gap-2 text-neutral-800">
                <StickyNote className="w-5 h-5" />
                <h2 className="text-xl font-medium">Notes</h2>
              </div>

            {/* Add Note Form */}
            <form onSubmit={addNote} className="relative group">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note..."
                className="w-full min-h-[100px] p-4 bg-yellow-50/30 rounded-xl border border-yellow-100 focus:border-yellow-200 outline-none resize-none text-neutral-800 placeholder:text-neutral-400 transition-colors focus:bg-yellow-50/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addNote(e);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                 <span className="text-[10px] text-neutral-400 mr-2">Press Enter to save</span>
              </div>
            </form>

            {/* Notes List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {notes.length === 0 && (
                <div className="col-span-full text-center py-8 text-neutral-400 text-sm">No notes yet.</div>
              )}
              {notes.map((note) => (
                <div key={note.id} className="group relative bg-white p-4 rounded-xl border border-neutral-100 hover:shadow-sm hover:border-neutral-200 transition-all">
                  <p className="whitespace-pre-wrap text-sm text-neutral-700 leading-relaxed mb-6 break-words">{note.content}</p>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400">{format(new Date(note.createdAt), 'MMM d')}</span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-neutral-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
