-- Focus Assessments Database Schema
-- Block 4: Initial database structure

-- Course types (FAW, EFAW, PFA)
CREATE TABLE course_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  default_pass_mark INT,
  default_duration_mins INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Papers for each course type
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_type_id UUID REFERENCES course_types(id),
  label TEXT,
  version TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trainers
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment sittings
CREATE TABLE sittings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id),
  trainer_id UUID REFERENCES trainers(id),
  status TEXT CHECK (status IN ('ready','in_progress','closed')) DEFAULT 'ready',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  short_code TEXT UNIQUE,
  token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment attempts (student joining a sitting)
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitting_id UUID REFERENCES sittings(id),
  student_id UUID REFERENCES students(id),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score INT DEFAULT 0,
  pass BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student responses to questions
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id),
  question_id UUID,
  selected_index INT,
  correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE course_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sittings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_papers_course_type ON papers(course_type_id);
CREATE INDEX idx_sittings_paper ON sittings(paper_id);
CREATE INDEX idx_sittings_trainer ON sittings(trainer_id);
CREATE INDEX idx_sittings_short_code ON sittings(short_code);
CREATE INDEX idx_sittings_token ON sittings(token);
CREATE INDEX idx_attempts_sitting ON attempts(sitting_id);
CREATE INDEX idx_attempts_student ON attempts(student_id);
CREATE INDEX idx_responses_attempt ON responses(attempt_id);

-- Temporary RLS policies (allow all for service role)
-- These will be refined in Block 5

CREATE POLICY "Allow service role all on course_types" ON course_types FOR ALL USING (true);
CREATE POLICY "Allow service role all on papers" ON papers FOR ALL USING (true);
CREATE POLICY "Allow service role all on trainers" ON trainers FOR ALL USING (true);
CREATE POLICY "Allow service role all on sittings" ON sittings FOR ALL USING (true);
CREATE POLICY "Allow service role all on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow service role all on attempts" ON attempts FOR ALL USING (true);
CREATE POLICY "Allow service role all on responses" ON responses FOR ALL USING (true);
