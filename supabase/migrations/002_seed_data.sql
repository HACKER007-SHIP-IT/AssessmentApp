-- Seed data for course types and papers
-- This provides the base data for FAW, EFAW, and PFA courses

-- Insert course types
INSERT INTO course_types (code, name, default_pass_mark, default_duration_mins) VALUES
  ('FAW', 'First Aid at Work', 72, 60),
  ('EFAW', 'Emergency First Aid at Work', 72, 40),
  ('PFA', 'Paediatric First Aid', 72, 50)
ON CONFLICT (code) DO NOTHING;

-- Insert papers for each course type
-- FAW Papers
INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 1', 'v1', true FROM course_types WHERE code = 'FAW'
ON CONFLICT DO NOTHING;

INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 2', 'v1', true FROM course_types WHERE code = 'FAW'
ON CONFLICT DO NOTHING;

-- EFAW Papers
INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 1', 'v1', true FROM course_types WHERE code = 'EFAW'
ON CONFLICT DO NOTHING;

INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 2', 'v1', true FROM course_types WHERE code = 'EFAW'
ON CONFLICT DO NOTHING;

-- PFA Papers
INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 1', 'v1', true FROM course_types WHERE code = 'PFA'
ON CONFLICT DO NOTHING;

INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 2', 'v1', true FROM course_types WHERE code = 'PFA'
ON CONFLICT DO NOTHING;
