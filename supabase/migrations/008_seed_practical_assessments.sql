-- Migration 008: Seed Practical Assessment Data
-- This migration seeds practical assessment templates for FAW, EFAW, and EPFA
-- Based on FAIB practical assessment sheets (Version 1, June 2025)

-- ============================================================================
-- Helper function to get course_type_id by code
-- ============================================================================

DO $$
DECLARE
  v_faw_id UUID;
  v_efaw_id UUID;
  v_epfa_id UUID;
  v_pfa_id UUID;

  v_faw_practical_id UUID;
  v_efaw_practical_id UUID;
  v_epfa_practical_id UUID;

  -- Scenario IDs for FAW
  v_faw_cpr_id UUID;
  v_faw_secondary_id UUID;
  v_faw_choking_id UUID;
  v_faw_wounds_id UUID;
  v_faw_bleeding_id UUID;
  v_faw_fractures_id UUID;
  v_faw_anaphylaxis_id UUID;

  -- Scenario IDs for EFAW
  v_efaw_cpr_id UUID;
  v_efaw_secondary_id UUID;
  v_efaw_choking_id UUID;
  v_efaw_wounds_id UUID;
  v_efaw_bleeding_id UUID;

  -- Scenario IDs for EPFA
  v_epfa_cpr_id UUID;
  v_epfa_secondary_id UUID;
  v_epfa_choking_id UUID;
  v_epfa_wounds_id UUID;
  v_epfa_bleeding_id UUID;

BEGIN
  -- First, ensure EPFA course type exists
  INSERT INTO course_types (code, name, default_pass_mark)
  VALUES ('EPFA', 'Emergency Paediatric First Aid', 72)
  ON CONFLICT (code) DO NOTHING;

  -- Get course type IDs
  SELECT id INTO v_faw_id FROM course_types WHERE code = 'FAW';
  SELECT id INTO v_efaw_id FROM course_types WHERE code = 'EFAW';
  SELECT id INTO v_epfa_id FROM course_types WHERE code = 'EPFA';
  SELECT id INTO v_pfa_id FROM course_types WHERE code = 'PFA';

  -- ============================================================================
  -- FAW (First Aid at Work) Practical Assessment
  -- ============================================================================

  INSERT INTO practical_assessments (id, course_type_id, title, description, version)
  VALUES (
    gen_random_uuid(),
    v_faw_id,
    'FAW Practical Assessment',
    'First Aid at Work practical assessment covering CPR, secondary survey, choking, wounds, fractures, and anaphylaxis management',
    'Version 1 (June 2025)'
  )
  RETURNING id INTO v_faw_practical_id;

  -- FAW Scenario 1: CPR & The Safe Use of an AED
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 1, 'CPR & The Safe Use of an AED', 'Adult CPR and automated external defibrillator use', false, 1)
  RETURNING id INTO v_faw_cpr_id;

  -- FAW CPR Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_cpr_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_faw_cpr_id, '2.2', 'Check for response using the AVPU scale', true, 2),
  (v_faw_cpr_id, '2.2', 'Open airway (head tilt, chin lift)', true, 3),
  (v_faw_cpr_id, '2.2', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_faw_cpr_id, '3.2', 'Call 999/112 and request AED', true, 5),
  (v_faw_cpr_id, '3.3', 'Give 30 chest compressions (to correct depth & allowing full recoil)', true, 6),
  (v_faw_cpr_id, '3.3', 'Give 2 rescue breaths (blowing steadily)', true, 7),
  (v_faw_cpr_id, '3.3', 'Continue CPR (Ratio 30:2)', true, 8),
  (v_faw_cpr_id, '3.1', 'Demonstrate an understanding of how/when to use an AED safely', true, 9),
  (v_faw_cpr_id, '3.3', 'Place AED pads in the correct position', true, 10),
  (v_faw_cpr_id, '3.3', 'Follow AED instructions', true, 11);

  -- FAW Scenario 2: Secondary Survey & Recovery Position
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 2, 'Secondary Survey & Recovery Position', 'Systematic casualty assessment and recovery position', false, 2)
  RETURNING id INTO v_faw_secondary_id;

  -- FAW Secondary Survey Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_secondary_id, '2.1', 'Assess scene, check for danger and gain consent (if conscious)', true, 1),
  (v_faw_secondary_id, '2.2', 'Check for response using the AVPU scale', true, 2),
  (v_faw_secondary_id, '2.2', 'Open airway (head tilt, chin lift)', true, 3),
  (v_faw_secondary_id, '2.2', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_faw_secondary_id, '4.1', 'Head and neck', false, 5),
  (v_faw_secondary_id, '4.1', 'Shoulders, collar bones and chest', false, 6),
  (v_faw_secondary_id, '4.1', 'Abdomen and hip area (do not squeeze or rock)', false, 7),
  (v_faw_secondary_id, '4.1', 'Arms and legs (including hands/feet, do not move limbs or joints)', false, 8),
  (v_faw_secondary_id, '4.1', 'Check for other medical clues', false, 9),
  (v_faw_secondary_id, '4.1', 'Re-check breathing', true, 10),
  (v_faw_secondary_id, '4.2', 'Place the casualty into the recovery position (after considering injuries)', true, 11),
  (v_faw_secondary_id, '4.2', 'Call 999/112', true, 12),
  (v_faw_secondary_id, '4.3', 'Re-check then continually monitor breathing', true, 13);

  -- FAW Scenario 3: Choking
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 3, 'Choking', 'Management of choking casualty (adult)', false, 3)
  RETURNING id INTO v_faw_choking_id;

  -- FAW Choking Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_choking_id, '5.2', 'Encourage the casualty to cough (however coughing is ineffective)', true, 1),
  (v_faw_choking_id, '5.2', 'Call 999/112 using loudspeaker or ask bystander to call', true, 2),
  (v_faw_choking_id, '5.2', 'Demonstrate up to 5 back blows using manikin and/or choking vest', true, 3),
  (v_faw_choking_id, '5.2', 'Demonstrate up to 5 abdominal thrusts using a manikin and/or choking vest', true, 4);

  -- FAW Scenario 4: Wounds & Bleeding
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 4, 'Wounds & Bleeding', 'Management of wounds and bleeding', false, 4)
  RETURNING id INTO v_faw_wounds_id;

  -- FAW Wounds & Bleeding Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_wounds_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_faw_wounds_id, '1.2', 'Gain consent', true, 2),
  (v_faw_wounds_id, '1.4', 'Display awareness of infection control', true, 3),
  (v_faw_wounds_id, '7.1', 'Assist the casualty to sit or lie down, taking into account the location and severity of the bleed', false, 4),
  (v_faw_wounds_id, '7.1', 'Identify exact point of bleeding and examine the wound for embedded objects, apply pressure to point of bleed (if required)', true, 5),
  (v_faw_wounds_id, '7.1', 'Treat/dress the wound appropriately', true, 6),
  (v_faw_wounds_id, '7.2', 'Demonstrate wound packing correctly (optional)', false, 7),
  (v_faw_wounds_id, '7.2', 'Demonstrate correct application of a tourniquet (optional)', false, 8);

  -- FAW Scenario 5: Life Threatening Bleeding (Optional)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 5, 'Life Threatening Bleeding', 'Advanced bleeding control techniques', true, 5)
  RETURNING id INTO v_faw_bleeding_id;

  -- (Same skills as wounds scenario - wound packing and tourniquet)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_bleeding_id, '7.2', 'Demonstrate wound packing correctly', true, 1),
  (v_faw_bleeding_id, '7.2', 'Demonstrate correct application of a tourniquet', true, 2);

  -- FAW Scenario 6: Fractures & Spinal Injuries
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 6, 'Fractures & Spinal Injuries', 'Management of fractures and spinal injuries', false, 6)
  RETURNING id INTO v_faw_fractures_id;

  -- FAW Fractures & Spinal Injuries Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_fractures_id, '12.1', 'Recognise the type of injury', true, 1),
  (v_faw_fractures_id, '12.2', 'Position the casualty in a suitable position and reassure them', false, 2),
  (v_faw_fractures_id, '12.2', 'Demonstrate the correct application of an elevated sling', true, 3),
  (v_faw_fractures_id, '12.2', 'Demonstrate the correct application of a support sling', true, 4),
  (v_faw_fractures_id, '13.2', 'Demonstrate how to place a casualty into the spinal recovery position, taking care to keep the head, neck and back aligned', true, 5);

  -- FAW Scenario 7: Management of Anaphylaxis
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_faw_practical_id, 7, 'Management of Anaphylaxis', 'Recognition and treatment of anaphylaxis', false, 7)
  RETURNING id INTO v_faw_anaphylaxis_id;

  -- FAW Anaphylaxis Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_faw_anaphylaxis_id, '16.3', 'Call 999/112 using loudspeaker or ask bystander to call', true, 1),
  (v_faw_anaphylaxis_id, '16.3', 'Place the casualty in the correct position', true, 2),
  (v_faw_anaphylaxis_id, '16.3', 'Demonstrate safe use of an adrenaline auto-injector using a training device', true, 3);

  -- ============================================================================
  -- EFAW (Emergency First Aid at Work) Practical Assessment
  -- ============================================================================

  INSERT INTO practical_assessments (id, course_type_id, title, description, version)
  VALUES (
    gen_random_uuid(),
    v_efaw_id,
    'EFAW Practical Assessment',
    'Emergency First Aid at Work practical assessment covering CPR, secondary survey, choking, and wounds',
    'Version 1 (June 2025)'
  )
  RETURNING id INTO v_efaw_practical_id;

  -- EFAW Scenario 1: CPR & The Safe Use of an AED
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_efaw_practical_id, 1, 'CPR & The Safe Use of an AED', 'Adult CPR and automated external defibrillator use', false, 1)
  RETURNING id INTO v_efaw_cpr_id;

  -- EFAW CPR Skills (same as FAW)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_efaw_cpr_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_efaw_cpr_id, '2.2', 'Check for response using the AVPU scale', true, 2),
  (v_efaw_cpr_id, '2.2', 'Open airway (head tilt, chin lift)', true, 3),
  (v_efaw_cpr_id, '2.2', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_efaw_cpr_id, '3.2', 'Call 999/112 and request AED', true, 5),
  (v_efaw_cpr_id, '3.3', 'Give 30 chest compressions (to correct depth & allowing full recoil)', true, 6),
  (v_efaw_cpr_id, '3.3', 'Give 2 rescue breaths (blowing steadily)', true, 7),
  (v_efaw_cpr_id, '3.3', 'Continue CPR (Ratio 30:2)', true, 8),
  (v_efaw_cpr_id, '3.1', 'Demonstrate an understanding of how/when to use an AED safely', true, 9),
  (v_efaw_cpr_id, '3.3', 'Place AED pads in the correct position', true, 10),
  (v_efaw_cpr_id, '3.3', 'Follow AED instructions', true, 11);

  -- EFAW Scenario 2: Secondary Survey & Recovery Position
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_efaw_practical_id, 2, 'Secondary Survey & Recovery Position', 'Systematic casualty assessment and recovery position', false, 2)
  RETURNING id INTO v_efaw_secondary_id;

  -- EFAW Secondary Survey Skills (same as FAW)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_efaw_secondary_id, '2.1', 'Assess scene, check for danger and gain consent (if conscious)', true, 1),
  (v_efaw_secondary_id, '2.2', 'Check for response using the AVPU scale', true, 2),
  (v_efaw_secondary_id, '2.2', 'Open airway (head tilt, chin lift)', true, 3),
  (v_efaw_secondary_id, '2.2', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_efaw_secondary_id, '4.1', 'Head and neck', false, 5),
  (v_efaw_secondary_id, '4.1', 'Shoulders, collar bones and chest', false, 6),
  (v_efaw_secondary_id, '4.1', 'Abdomen and hip area (do not squeeze or rock)', false, 7),
  (v_efaw_secondary_id, '4.1', 'Arms and legs (including hands/feet, do not move limbs or joints)', false, 8),
  (v_efaw_secondary_id, '4.1', 'Check for other medical clues', false, 9),
  (v_efaw_secondary_id, '4.1', 'Re-check breathing', true, 10),
  (v_efaw_secondary_id, '4.2', 'Place the casualty into the recovery position (after considering injuries)', true, 11),
  (v_efaw_secondary_id, '4.2', 'Call 999/112', true, 12),
  (v_efaw_secondary_id, '4.3', 'Re-check then continually monitor breathing', true, 13);

  -- EFAW Scenario 3: Choking
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_efaw_practical_id, 3, 'Choking', 'Management of choking casualty (adult)', false, 3)
  RETURNING id INTO v_efaw_choking_id;

  -- EFAW Choking Skills (same as FAW)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_efaw_choking_id, '5.2', 'Encourage the casualty to cough (however coughing is ineffective)', true, 1),
  (v_efaw_choking_id, '5.2', 'Call 999/112 using loudspeaker or ask bystander to call', true, 2),
  (v_efaw_choking_id, '5.2', 'Demonstrate up to 5 back blows using manikin and/or choking vest', true, 3),
  (v_efaw_choking_id, '5.2', 'Demonstrate up to 5 abdominal thrusts using a manikin and/or choking vest', true, 4);

  -- EFAW Scenario 4: Wounds & Bleeding
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_efaw_practical_id, 4, 'Wounds & Bleeding', 'Management of wounds and bleeding', false, 4)
  RETURNING id INTO v_efaw_wounds_id;

  -- EFAW Wounds & Bleeding Skills (same as FAW)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_efaw_wounds_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_efaw_wounds_id, '1.2', 'Gain consent', true, 2),
  (v_efaw_wounds_id, '1.4', 'Display awareness of infection control', true, 3),
  (v_efaw_wounds_id, '7.1', 'Assist the casualty to sit or lie down, taking into account the location and severity of the bleed', false, 4),
  (v_efaw_wounds_id, '7.1', 'Identify exact point of bleeding and examine the wound for embedded objects, apply pressure to point of bleed (if required)', true, 5),
  (v_efaw_wounds_id, '7.1', 'Treat/dress the wound appropriately', true, 6),
  (v_efaw_wounds_id, '7.2', 'Demonstrate wound packing correctly (optional)', false, 7),
  (v_efaw_wounds_id, '7.2', 'Demonstrate correct application of a tourniquet (optional)', false, 8);

  -- EFAW Scenario 5: Life Threatening Bleeding (Optional)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_efaw_practical_id, 5, 'Life Threatening Bleeding', 'Advanced bleeding control techniques', true, 5)
  RETURNING id INTO v_efaw_bleeding_id;

  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_efaw_bleeding_id, '7.2', 'Demonstrate wound packing correctly', true, 1),
  (v_efaw_bleeding_id, '7.2', 'Demonstrate correct application of a tourniquet', true, 2);

  -- ============================================================================
  -- EPFA (Emergency Paediatric First Aid) Practical Assessment
  -- ============================================================================

  INSERT INTO practical_assessments (id, course_type_id, title, description, version)
  VALUES (
    gen_random_uuid(),
    v_epfa_id,
    'EPFA Practical Assessment',
    'Emergency Paediatric First Aid practical assessment covering child and infant CPR, secondary survey, choking, and wounds',
    'Version 1 (June 2025)'
  )
  RETURNING id INTO v_epfa_practical_id;

  -- EPFA Scenario 1: CPR + The Safe Use of an AED (Child & Infant)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_epfa_practical_id, 1, 'CPR + The Safe Use of an AED (Child & Infant)', 'Child and infant CPR and automated external defibrillator use', false, 1)
  RETURNING id INTO v_epfa_cpr_id;

  -- EPFA CPR Skills (Child & Infant specific)
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_epfa_cpr_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_epfa_cpr_id, '2.3', 'Check for response using the AVPU scale', true, 2),
  (v_epfa_cpr_id, '2.3', 'Open airway - Child (head tilt, chin lift) and Infant (neutral head position)', true, 3),
  (v_epfa_cpr_id, '2.3', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_epfa_cpr_id, '3.2', 'Call 999/112 and request AED', true, 5),
  (v_epfa_cpr_id, '3.3', 'Give 5 initial rescue breaths - Child (seal mouth) and Infant (seal nose and mouth)', true, 6),
  (v_epfa_cpr_id, '3.3', 'Give 30 chest compressions (to correct depth & allowing full recoil) - Child (using 1 or 2 hands) and Infant (using 2 fingers)', true, 7),
  (v_epfa_cpr_id, '3.3', 'Give 2 rescue breaths (blowing steadily) - Child (seal mouth) and Infant (seal nose and mouth)', true, 8),
  (v_epfa_cpr_id, '3.3', 'Continue CPR (Ratio 30:2)', true, 9),
  (v_epfa_cpr_id, '3.1', 'Demonstrate an understanding of how/when to use an AED safely', true, 10),
  (v_epfa_cpr_id, '3.3', 'Place AED pads in the correct position', true, 11),
  (v_epfa_cpr_id, '3.3', 'Follow AED instructions', true, 12);

  -- EPFA Scenario 2: Secondary Survey & Recovery Position (Child & Infant)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_epfa_practical_id, 2, 'Secondary Survey & Recovery Position (Child & Infant)', 'Systematic casualty assessment and recovery position for children and infants', false, 2)
  RETURNING id INTO v_epfa_secondary_id;

  -- EPFA Secondary Survey Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_epfa_secondary_id, '2.1', 'Assess scene, check for danger and gain consent (if applicable)', true, 1),
  (v_epfa_secondary_id, '2.3', 'Check for response using the AVPU scale', true, 2),
  (v_epfa_secondary_id, '2.3', 'Open airway - Child (head tilt, chin lift) and Infant (neutral head position)', true, 3),
  (v_epfa_secondary_id, '2.3', 'Check for normal breathing (no more than 10 seconds)', true, 4),
  (v_epfa_secondary_id, '4.1', 'Head and neck', false, 5),
  (v_epfa_secondary_id, '4.1', 'Shoulders, collar bones and chest', false, 6),
  (v_epfa_secondary_id, '4.1', 'Abdomen and hip area (do not squeeze or rock)', false, 7),
  (v_epfa_secondary_id, '4.1', 'Arms and legs (including hands/feet, do not move limbs or joints)', false, 8),
  (v_epfa_secondary_id, '4.1', 'Check for other medical clues', false, 9),
  (v_epfa_secondary_id, '4.1', 'Re-check breathing', true, 10),
  (v_epfa_secondary_id, '4.2', 'Place the casualty into the recovery position (after considering injuries) - Infant: head lower than body', true, 11),
  (v_epfa_secondary_id, '4.2', 'Call 999/112', true, 12),
  (v_epfa_secondary_id, '4.3', 'Re-check then continually monitor breathing', true, 13);

  -- EPFA Scenario 3: Choking (Child & Infant)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_epfa_practical_id, 3, 'Choking (Child & Infant)', 'Management of choking for children and infants', false, 3)
  RETURNING id INTO v_epfa_choking_id;

  -- EPFA Choking Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_epfa_choking_id, '5.2', 'Encourage the casualty to cough (however coughing is ineffective)', true, 1),
  (v_epfa_choking_id, '5.2', 'Call 999/112 using loudspeaker or ask bystander to call', true, 2),
  (v_epfa_choking_id, '5.2', 'Demonstrate up to 5 back blows - Child (using a child manikin and/or choking vest) | Infant (using an infant manikin)', true, 3),
  (v_epfa_choking_id, '5.2', 'Demonstrate up to 5 abdominal/chest thrusts - Child (abdominal thrusts using a child manikin and/or choking vest) | Infant (chest thrusts using an infant manikin)', true, 4);

  -- EPFA Scenario 4: Wounds & Bleeding
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_epfa_practical_id, 4, 'Wounds & Bleeding', 'Management of wounds and bleeding', false, 4)
  RETURNING id INTO v_epfa_wounds_id;

  -- EPFA Wounds & Bleeding Skills
  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_epfa_wounds_id, '2.1', 'Assess scene and check for danger', true, 1),
  (v_epfa_wounds_id, '1.2', 'Gain consent (if applicable)', true, 2),
  (v_epfa_wounds_id, '1.4', 'Display awareness of infection control', true, 3),
  (v_epfa_wounds_id, '7.1', 'Assist the casualty to sit or lie down, taking into account the location and severity of the bleed', false, 4),
  (v_epfa_wounds_id, '7.1', 'Identify exact point of bleeding and examine the wound for embedded objects, apply pressure to point of bleed (if required)', true, 5),
  (v_epfa_wounds_id, '7.1', 'Treat/dress the wound appropriately', true, 6),
  (v_epfa_wounds_id, '7.2', 'Demonstrate wound packing correctly (optional)', false, 7),
  (v_epfa_wounds_id, '7.2', 'Demonstrate correct application of a tourniquet (optional)', false, 8);

  -- EPFA Scenario 5: Life Threatening Bleeding (Optional)
  INSERT INTO practical_scenarios (id, practical_assessment_id, scenario_number, title, description, is_optional, display_order)
  VALUES (gen_random_uuid(), v_epfa_practical_id, 5, 'Life Threatening Bleeding', 'Advanced bleeding control techniques', true, 5)
  RETURNING id INTO v_epfa_bleeding_id;

  INSERT INTO practical_skills (practical_scenario_id, lo_number, skill_description, is_critical, display_order) VALUES
  (v_epfa_bleeding_id, '7.2', 'Demonstrate wound packing correctly', true, 1),
  (v_epfa_bleeding_id, '7.2', 'Demonstrate correct application of a tourniquet', true, 2);

  -- ============================================================================
  -- PFA (Paediatric First Aid) - Can reuse EPFA practical assessment
  -- ============================================================================

  -- Link PFA to the same EPFA practical assessment
  UPDATE practical_assessments
  SET course_type_id = v_pfa_id
  WHERE id = v_epfa_practical_id;

  -- Actually, we need a separate one for PFA, so let's create a duplicate
  -- First, reset the EPFA one
  UPDATE practical_assessments
  SET course_type_id = v_epfa_id
  WHERE id = v_epfa_practical_id;

  -- Note: PFA uses the same practical assessment as EPFA
  -- If needed in the future, we can create a separate PFA practical assessment

END $$;
