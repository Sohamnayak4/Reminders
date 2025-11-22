'use server';

import pool, { initDB } from '@/lib/db';

export type ReminderType = 'deadline' | 'test' | 'other';

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: ReminderType;
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

// Ensure tables exist
initDB().catch(console.error);

export async function getReminders() {
  const result = await pool.query('SELECT * FROM reminders');
  return result.rows;
}

export async function addReminder(reminder: Reminder) {
  await pool.query(
    'INSERT INTO reminders (id, title, date, type, completed) VALUES ($1, $2, $3, $4, $5)',
    [reminder.id, reminder.title, reminder.date, reminder.type, reminder.completed]
  );
}

export async function toggleReminder(id: string, completed: boolean) {
  await pool.query(
    'UPDATE reminders SET completed = $1 WHERE id = $2',
    [completed, id]
  );
}

export async function deleteReminder(id: string) {
  await pool.query('DELETE FROM reminders WHERE id = $1', [id]);
}

export async function getNotes() {
  const result = await pool.query('SELECT id, content, created_at as "createdAt" FROM notes ORDER BY created_at DESC');
  return result.rows;
}

export async function addNote(note: Note) {
  await pool.query(
    'INSERT INTO notes (id, content, created_at) VALUES ($1, $2, $3)',
    [note.id, note.content, note.createdAt]
  );
}

export async function deleteNote(id: string) {
  await pool.query('DELETE FROM notes WHERE id = $1', [id]);
}

