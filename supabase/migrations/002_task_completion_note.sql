-- Add completion_note to tasks (run in Neon SQL Editor)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_note TEXT;
