-- Block 5: Seed Sample Questions
-- This creates sample questions for each paper type

-- Helper function to get paper IDs
DO $$
DECLARE
  faw_paper1_id UUID;
  faw_paper2_id UUID;
  efaw_paper1_id UUID;
  efaw_paper2_id UUID;
  pfa_paper1_id UUID;
  pfa_paper2_id UUID;
BEGIN
  -- Get paper IDs
  SELECT id INTO faw_paper1_id FROM papers WHERE label = 'Paper 1' AND course_type_id = (SELECT id FROM course_types WHERE code = 'FAW');
  SELECT id INTO faw_paper2_id FROM papers WHERE label = 'Paper 2' AND course_type_id = (SELECT id FROM course_types WHERE code = 'FAW');
  SELECT id INTO efaw_paper1_id FROM papers WHERE label = 'Paper 1' AND course_type_id = (SELECT id FROM course_types WHERE code = 'EFAW');
  SELECT id INTO efaw_paper2_id FROM papers WHERE label = 'Paper 2' AND course_type_id = (SELECT id FROM course_types WHERE code = 'EFAW');
  SELECT id INTO pfa_paper1_id FROM papers WHERE label = 'Paper 1' AND course_type_id = (SELECT id FROM course_types WHERE code = 'PFA');
  SELECT id INTO pfa_paper2_id FROM papers WHERE label = 'Paper 2' AND course_type_id = (SELECT id FROM course_types WHERE code = 'PFA');

  -- FAW Paper 1 Questions (20 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (faw_paper1_id, 1, 'What is the primary survey used for?', 'To check for minor injuries', 'To assess life-threatening conditions', 'To document the incident', 'To call for help', 'B'),
  (faw_paper1_id, 2, 'What does CPR stand for?', 'Cardiac Pulmonary Response', 'Cardiopulmonary Resuscitation', 'Cardiac Pressure Recovery', 'Critical Patient Revival', 'B'),
  (faw_paper1_id, 3, 'What is the correct compression-to-breath ratio for adult CPR?', '15:2', '30:2', '5:1', '20:2', 'B'),
  (faw_paper1_id, 4, 'At what depth should chest compressions be performed on an adult?', '3-4 cm', '4-5 cm', '5-6 cm', '6-7 cm', 'C'),
  (faw_paper1_id, 5, 'What is the recovery position used for?', 'Keeping an unconscious breathing casualty safe', 'Treating fractures', 'Preventing shock', 'Controlling bleeding', 'A'),
  (faw_paper1_id, 6, 'How should you treat a minor burn?', 'Apply butter or oil', 'Cool with running water for at least 10 minutes', 'Pop any blisters', 'Apply ice directly', 'B'),
  (faw_paper1_id, 7, 'What is the main purpose of the Heimlich maneuver?', 'To restore breathing in drowning victims', 'To dislodge an object from the airway', 'To treat shock', 'To stop bleeding', 'B'),
  (faw_paper1_id, 8, 'Which of the following is a sign of shock?', 'Slow pulse', 'Flushed warm skin', 'Pale cold clammy skin', 'High blood pressure', 'C'),
  (faw_paper1_id, 9, 'What should you do if someone is having a seizure?', 'Restrain them', 'Put something in their mouth', 'Protect them from injury', 'Give them water', 'C'),
  (faw_paper1_id, 10, 'How long should you check for breathing in an unconscious casualty?', '5 seconds', 'No more than 10 seconds', '30 seconds', '1 minute', 'B'),
  (faw_paper1_id, 11, 'What is the first step in treating severe bleeding?', 'Apply a tourniquet', 'Apply direct pressure', 'Elevate the limb', 'Clean the wound', 'B'),
  (faw_paper1_id, 12, 'What temperature water should be used to cool a burn?', 'Ice cold water', 'Lukewarm or cool running water', 'Hot water', 'Salt water', 'B'),
  (faw_paper1_id, 13, 'How should you open the airway of a casualty?', 'Tilt the head back and lift the chin', 'Push the jaw forward', 'Turn them on their side', 'Press on their chest', 'A'),
  (faw_paper1_id, 14, 'What does DRSABC stand for?', 'Danger, Response, Send, Airway, Breathing, CPR', 'Danger, Response, Shout, Airway, Breathing, Circulation', 'Delay, Respond, Send, Alert, Breathe, Compress', 'Danger, React, Shout, Assess, Breathe, Circulate', 'A'),
  (faw_paper1_id, 15, 'When should you call for emergency help?', 'After completing all first aid', 'As soon as you identify a serious condition', 'After moving the casualty', 'Only if requested', 'B'),
  (faw_paper1_id, 16, 'What is the best way to treat a suspected spinal injury?', 'Move them immediately', 'Keep them still and support their head', 'Sit them up', 'Roll them onto their side', 'B'),
  (faw_paper1_id, 17, 'How can you tell if a bone is broken?', 'The casualty can still move it', 'Deformity, swelling, and severe pain', 'Slight bruising', 'Mild discomfort', 'B'),
  (faw_paper1_id, 18, 'What should you do for someone experiencing a diabetic emergency with low blood sugar?', 'Give them insulin', 'Give them something sugary to eat or drink', 'Make them exercise', 'Give them nothing', 'B'),
  (faw_paper1_id, 19, 'What is anaphylaxis?', 'A minor allergic reaction', 'A severe life-threatening allergic reaction', 'A type of asthma', 'A heart condition', 'B'),
  (faw_paper1_id, 20, 'How should you position someone who is in shock?', 'Sitting upright', 'Lying down with legs raised', 'Standing', 'On their side', 'B');

  -- FAW Paper 2 Questions (20 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (faw_paper2_id, 1, 'What is the first action when you discover an incident?', 'Approach the casualty immediately', 'Check for danger', 'Call for help', 'Start CPR', 'B'),
  (faw_paper2_id, 2, 'How many chest compressions per minute should be given during CPR?', '60-80', '80-100', '100-120', '120-140', 'C'),
  (faw_paper2_id, 3, 'When treating a wound, what should you wear?', 'Nothing special', 'Disposable gloves', 'A face mask only', 'A full protective suit', 'B'),
  (faw_paper2_id, 4, 'What is the purpose of a head tilt and chin lift?', 'To make the casualty comfortable', 'To open the airway', 'To check for injuries', 'To position for recovery', 'B'),
  (faw_paper2_id, 5, 'How should you treat a nosebleed?', 'Tilt the head back', 'Lean forward and pinch the soft part of the nose', 'Lie flat', 'Put tissue up the nose', 'B'),
  (faw_paper2_id, 6, 'What is the correct rate for rescue breaths?', 'As fast as possible', 'One breath every 5-6 seconds', 'One breath every second', 'One breath every 10 seconds', 'B'),
  (faw_paper2_id, 7, 'What should you do if you suspect a head injury?', 'Move the casualty immediately', 'Keep the head and neck still', 'Give them water', 'Make them stand up', 'B'),
  (faw_paper2_id, 8, 'How do you check if someone is responsive?', 'Shake them vigorously', 'Shout and gently shake their shoulders', 'Pour water on them', 'Slap their face', 'B'),
  (faw_paper2_id, 9, 'What is the main risk of hypothermia?', 'Overheating', 'Loss of consciousness and heart problems', 'Dehydration', 'Sunburn', 'B'),
  (faw_paper2_id, 10, 'How should you treat a chemical burn to the eye?', 'Rub the eye', 'Rinse with clean water for at least 10 minutes', 'Apply eye drops', 'Cover with a bandage', 'B'),
  (faw_paper2_id, 11, 'What is the correct position for an unconscious breathing casualty?', 'Flat on their back', 'Recovery position', 'Sitting upright', 'Face down', 'B'),
  (faw_paper2_id, 12, 'How long should a dressing be applied to a burn?', 'Not at all, leave it exposed', 'Only after medical assessment', 'Cover loosely with cling film or a sterile dressing', 'Wrap tightly', 'C'),
  (faw_paper2_id, 13, 'What should you do if someone is choking but can cough?', 'Perform back blows immediately', 'Encourage them to keep coughing', 'Perform abdominal thrusts', 'Give them water', 'B'),
  (faw_paper2_id, 14, 'What does AED stand for?', 'Automatic Emergency Device', 'Automated External Defibrillator', 'Airway Emergency Device', 'Advanced Emergency Doctor', 'B'),
  (faw_paper2_id, 15, 'When should you stop CPR?', 'After 5 minutes', 'When help arrives or the casualty shows signs of life', 'After 10 compressions', 'Never', 'B'),
  (faw_paper2_id, 16, 'What is the best treatment for a minor cut?', 'Leave it to heal naturally', 'Clean and cover with a sterile dressing', 'Apply a tourniquet', 'Ignore it', 'B'),
  (faw_paper2_id, 17, 'How should you treat someone having a heart attack?', 'Make them exercise', 'Sit them down, keep them calm, call 999', 'Give them food', 'Put them to bed', 'B'),
  (faw_paper2_id, 18, 'What is the main purpose of the secondary survey?', 'To find life-threatening injuries', 'To find and treat other injuries after the primary survey', 'To document the incident', 'To practice first aid skills', 'B'),
  (faw_paper2_id, 19, 'How should you immobilize a suspected arm fracture?', 'Force it straight', 'Support with a sling in the position found', 'Ignore it', 'Apply heat', 'B'),
  (faw_paper2_id, 20, 'What should you do if someone faints?', 'Give them something to eat immediately', 'Lie them down and raise their legs', 'Sit them upright', 'Make them walk around', 'B');

  -- EFAW Paper 1 Questions (15 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (efaw_paper1_id, 1, 'What does EFAW stand for?', 'Emergency First Aid Work', 'Emergency First Aid at Work', 'Extended First Aid Workplace', 'Emergency Fast Aid Work', 'B'),
  (efaw_paper1_id, 2, 'How should you check for breathing?', 'Listen only', 'Look, listen, and feel', 'Feel only', 'Ask the casualty', 'B'),
  (efaw_paper1_id, 3, 'What is the compression depth for adult CPR?', '3-4 cm', '5-6 cm', '7-8 cm', '2-3 cm', 'B'),
  (efaw_paper1_id, 4, 'When should you place someone in the recovery position?', 'If they are unconscious and breathing', 'If they are conscious', 'If they have a broken leg', 'If they are bleeding', 'A'),
  (efaw_paper1_id, 5, 'How long should you cool a burn with water?', '1 minute', '5 minutes', 'At least 10 minutes', '30 minutes', 'C'),
  (efaw_paper1_id, 6, 'What is the main sign of choking?', 'Coughing loudly', 'Unable to speak or breathe', 'Sweating', 'Pale skin', 'B'),
  (efaw_paper1_id, 7, 'How should you control severe bleeding?', 'Wash the wound first', 'Apply direct pressure', 'Apply a tourniquet immediately', 'Elevate only', 'B'),
  (efaw_paper1_id, 8, 'What does CPR help to do?', 'Cure heart disease', 'Maintain circulation and breathing', 'Fix broken bones', 'Stop bleeding', 'B'),
  (efaw_paper1_id, 9, 'How can you recognize shock?', 'Fast pulse and warm skin', 'Slow pulse and pale skin', 'Fast pulse and pale cold clammy skin', 'Normal appearance', 'C'),
  (efaw_paper1_id, 10, 'What should you do first when someone has a seizure?', 'Protect from injury and time the seizure', 'Restrain them', 'Give them water', 'Call their family', 'A'),
  (efaw_paper1_id, 11, 'When using an AED, what should you do first?', 'Turn it on and follow the prompts', 'Check the battery', 'Read the manual', 'Call for help', 'A'),
  (efaw_paper1_id, 12, 'How do you treat a minor burn?', 'Apply ice', 'Cool with running water', 'Apply cream', 'Pop blisters', 'B'),
  (efaw_paper1_id, 13, 'What is the first step in any emergency?', 'Call 999', 'Check for danger', 'Start treatment', 'Move the casualty', 'B'),
  (efaw_paper1_id, 14, 'How should you open an airway?', 'Tilt head back and lift chin', 'Turn them over', 'Press on chest', 'Wait for help', 'A'),
  (efaw_paper1_id, 15, 'What position is best for someone in shock?', 'Sitting up', 'Lying down with legs raised', 'Standing', 'Recovery position', 'B');

  -- EFAW Paper 2 Questions (15 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (efaw_paper2_id, 1, 'What should you always check first at an incident?', 'The casualty', 'Danger', 'Your phone', 'Witnesses', 'B'),
  (efaw_paper2_id, 2, 'What is the compression to breath ratio for CPR?', '15:2', '30:2', '10:2', '20:2', 'B'),
  (efaw_paper2_id, 3, 'How many back blows should you give to a choking adult?', '3', '5', '10', 'As many as needed', 'B'),
  (efaw_paper2_id, 4, 'What is the recovery position for?', 'Broken bones', 'Unconscious breathing casualties', 'Conscious casualties', 'Bleeding wounds', 'B'),
  (efaw_paper2_id, 5, 'How should you treat a nosebleed?', 'Tilt head back', 'Lean forward and pinch nose', 'Lie down', 'Pack with tissue', 'B'),
  (efaw_paper2_id, 6, 'What should you wear when treating a bleeding wound?', 'Nothing', 'Disposable gloves', 'A mask', 'An apron', 'B'),
  (efaw_paper2_id, 7, 'How fast should chest compressions be?', '60 per minute', '100-120 per minute', '150 per minute', '200 per minute', 'B'),
  (efaw_paper2_id, 8, 'What is anaphylaxis?', 'A minor allergic reaction', 'A severe allergic reaction', 'A type of asthma', 'A skin condition', 'B'),
  (efaw_paper2_id, 9, 'How do you treat someone who has fainted?', 'Sit them upright', 'Lie them down and raise legs', 'Give them water', 'Make them walk', 'B'),
  (efaw_paper2_id, 10, 'What should you check for after ensuring safety?', 'Medical history', 'Response', 'Identification', 'Belongings', 'B'),
  (efaw_paper2_id, 11, 'When should you call 999?', 'For minor cuts', 'For serious or life-threatening conditions', 'After treating the casualty', 'Only if asked', 'B'),
  (efaw_paper2_id, 12, 'How long should you check for breathing?', '1 second', 'No more than 10 seconds', '30 seconds', '1 minute', 'B'),
  (efaw_paper2_id, 13, 'What is the best treatment for shock?', 'Give them a drink', 'Lie them down with legs raised and keep warm', 'Make them walk', 'Leave them alone', 'B'),
  (efaw_paper2_id, 14, 'How should you treat a burn after cooling?', 'Pop blisters', 'Cover loosely with cling film or sterile dressing', 'Apply butter', 'Leave exposed', 'B'),
  (efaw_paper2_id, 15, 'What does the "C" in CPR stand for?', 'Circulation', 'Cardiac', 'Compress', 'Compression', 'D');

  -- PFA Paper 1 Questions (18 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (pfa_paper1_id, 1, 'What is the compression depth for infant CPR?', '2-3 cm', '4 cm', '5-6 cm', '1 cm', 'B'),
  (pfa_paper1_id, 2, 'How should you check for breathing in an infant?', 'Shake them', 'Look, listen, and feel for no more than 10 seconds', 'Wait 1 minute', 'Listen only', 'B'),
  (pfa_paper1_id, 3, 'What is the compression to breath ratio for infant CPR (one rescuer)?', '15:2', '30:2', '5:1', '10:2', 'B'),
  (pfa_paper1_id, 4, 'How should you give back blows to a choking infant?', 'While they are sitting', 'Support on your forearm face down and give firm back blows', 'Lay them flat', 'Hold them upright', 'B'),
  (pfa_paper1_id, 5, 'At what temperature should you cool a child''s burn?', 'Ice cold', 'Lukewarm or cool running water', 'Hot water', 'No water', 'B'),
  (pfa_paper1_id, 6, 'How long should you cool a burn on a child?', '1 minute', '5 minutes', 'At least 10 minutes', 'Not at all', 'C'),
  (pfa_paper1_id, 7, 'What is the recovery position used for in children?', 'All injuries', 'Unconscious breathing casualties', 'Broken bones', 'Conscious casualties', 'B'),
  (pfa_paper1_id, 8, 'How many rescue breaths should you give to an infant before starting CPR?', '2', '5', '10', '0', 'B'),
  (pfa_paper1_id, 9, 'What should you do if an infant is unresponsive and not breathing?', 'Call for help immediately', 'Give 5 rescue breaths then call for help', 'Wait and see', 'Give them water', 'B'),
  (pfa_paper1_id, 10, 'How should you open the airway of an infant?', 'Tilt the head back fully', 'Place in a neutral position', 'Turn them on their side', 'Press on their chest', 'B'),
  (pfa_paper1_id, 11, 'What is meningitis?', 'A minor illness', 'A serious infection of the brain and spinal cord', 'A stomach bug', 'A skin rash', 'B'),
  (pfa_paper1_id, 12, 'How should you treat a nosebleed in a child?', 'Tilt head back', 'Lean forward and pinch the soft part', 'Lie them down', 'Pack with tissue', 'B'),
  (pfa_paper1_id, 13, 'What is a febrile seizure?', 'A seizure caused by low blood sugar', 'A seizure caused by high temperature', 'A seizure caused by injury', 'A seizure caused by choking', 'B'),
  (pfa_paper1_id, 14, 'How should you check if a child is responsive?', 'Shake them hard', 'Speak loudly and tap gently', 'Pour water on them', 'Wait for them to wake up', 'B'),
  (pfa_paper1_id, 15, 'What should you do for a child with a suspected head injury?', 'Move them immediately', 'Keep them still and monitor closely', 'Give them painkillers', 'Make them sleep', 'B'),
  (pfa_paper1_id, 16, 'How many chest compressions per minute for infant CPR?', '60-80', '100-120', '80-100', '120-140', 'B'),
  (pfa_paper1_id, 17, 'What is the best way to treat a minor graze in a child?', 'Leave it alone', 'Clean with water and cover with a sterile dressing', 'Apply antiseptic cream only', 'Ignore it', 'B'),
  (pfa_paper1_id, 18, 'When should you call emergency services for a child?', 'For minor injuries', 'For serious or life-threatening conditions', 'After all treatment', 'Only if the parent asks', 'B');

  -- PFA Paper 2 Questions (18 questions)
  INSERT INTO questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (pfa_paper2_id, 1, 'What is the first thing to do in an emergency?', 'Start CPR', 'Check for danger', 'Call 999', 'Move the child', 'B'),
  (pfa_paper2_id, 2, 'How should you position an unconscious breathing child?', 'On their back', 'Recovery position', 'Sitting up', 'Face down', 'B'),
  (pfa_paper2_id, 3, 'What technique should you use for chest compressions on an infant?', 'Two hands', 'Two fingers or thumbs', 'One hand', 'Fist', 'B'),
  (pfa_paper2_id, 4, 'How can you recognize anaphylaxis in a child?', 'Mild rash', 'Swelling, difficulty breathing, shock', 'Slight itching', 'Sneezing', 'B'),
  (pfa_paper2_id, 5, 'What is the treatment for anaphylaxis?', 'Give water', 'Use an auto-injector (EpiPen) and call 999', 'Wait and see', 'Give antihistamine only', 'B'),
  (pfa_paper2_id, 6, 'How should you treat a child in shock?', 'Sit them upright', 'Lie them down, raise legs, keep warm', 'Make them walk', 'Give them food', 'B'),
  (pfa_paper2_id, 7, 'What should you do if a child is having a febrile seizure?', 'Restrain them', 'Protect from injury and cool them down', 'Put something in their mouth', 'Ignore it', 'B'),
  (pfa_paper2_id, 8, 'How long should a seizure last before calling 999?', 'Any seizure requires 999', 'More than 5 minutes', '10 minutes', '15 minutes', 'B'),
  (pfa_paper2_id, 9, 'What is croup?', 'A skin condition', 'A respiratory condition causing barking cough', 'A stomach illness', 'An allergy', 'B'),
  (pfa_paper2_id, 10, 'How should you treat severe bleeding in a child?', 'Clean the wound first', 'Apply direct pressure with a clean pad', 'Use a tourniquet', 'Wash with soap', 'B'),
  (pfa_paper2_id, 11, 'What should you do if a baby is choking and unconscious?', 'Back blows only', 'Open airway, give 5 rescue breaths, start CPR', 'Wait for help', 'Shake them', 'B'),
  (pfa_paper2_id, 12, 'How can you tell if a child is in respiratory distress?', 'Pink skin and normal breathing', 'Fast breathing, using neck/chest muscles, blue lips', 'Slight cough', 'Sneezing', 'B'),
  (pfa_paper2_id, 13, 'What is the purpose of CPR in children?', 'To cure illness', 'To maintain blood and oxygen flow to vital organs', 'To warm them up', 'To stop bleeding', 'B'),
  (pfa_paper2_id, 14, 'How should you manage a nosebleed in a child?', 'Tilt head back', 'Sit them up, lean forward, pinch soft part of nose', 'Lie them down', 'Put tissue up the nose', 'B'),
  (pfa_paper2_id, 15, 'What is the glass test used for?', 'Eye injuries', 'Checking for meningitis rash', 'Broken bones', 'Burns', 'B'),
  (pfa_paper2_id, 16, 'When should you start CPR on an infant?', 'After 5 minutes', 'If unresponsive and not breathing normally', 'After calling 999', 'Never', 'B'),
  (pfa_paper2_id, 17, 'What is the best position for a child with difficulty breathing?', 'Lying flat', 'Sitting up in a comfortable position', 'Face down', 'Recovery position', 'B'),
  (pfa_paper2_id, 18, 'How should you treat a small burn on a child after cooling?', 'Pop blisters', 'Cover loosely with cling film or sterile dressing', 'Apply ice', 'Leave exposed', 'B');

END $$;
