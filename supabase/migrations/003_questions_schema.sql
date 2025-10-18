-- Block 5: Questions and Answers Schema
-- This migration adds the questions table and updates the responses table

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT CHECK (correct_answer IN ('A','B','C','D')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(paper_id, question_number)
);

-- Create index for faster lookups
CREATE INDEX idx_questions_paper_id ON questions(paper_id);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policy (will be tightened in production)
CREATE POLICY "Allow all operations on questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

-- Update responses table to link to questions
-- (Already exists from 001_initial_schema.sql, but let's ensure it has the right structure)

-- Add scoring fields to attempts table
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS score INT;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS total_questions INT;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS pass_mark INT;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS passed BOOLEAN;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for questions
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
