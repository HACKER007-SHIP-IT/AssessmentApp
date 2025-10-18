-- Seed data for Focus Assessments
-- Block 4: Initial course types and papers

-- Insert course types
INSERT INTO course_types (code, name, default_pass_mark, default_duration_mins)
VALUES
  ('FAW', 'First Aid at Work', 72, 45),
  ('EFAW', 'Emergency First Aid at Work', 72, 30),
  ('PFA', 'Paediatric First Aid', 72, 45);

-- Insert papers for each course type
INSERT INTO papers (course_type_id, label, version, is_active)
SELECT id, 'Paper 1', '1.0', true FROM course_types WHERE code = 'FAW'
UNION ALL
SELECT id, 'Paper 2', '1.0', true FROM course_types WHERE code = 'FAW'
UNION ALL
SELECT id, 'Paper 1', '1.0', true FROM course_types WHERE code = 'EFAW'
UNION ALL
SELECT id, 'Paper 2', '1.0', true FROM course_types WHERE code = 'EFAW'
UNION ALL
SELECT id, 'Paper 1', '1.0', true FROM course_types WHERE code = 'PFA'
UNION ALL
SELECT id, 'Paper 2', '1.0', true FROM course_types WHERE code = 'PFA';
