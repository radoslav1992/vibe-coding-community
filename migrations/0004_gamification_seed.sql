-- VibeShipyard · seed activity for gamification (lesson progress + RSVPs)

INSERT OR IGNORE INTO lesson_completions (lesson_id, user_id)
  SELECT id, 1 FROM lessons WHERE course_id = 1;
INSERT OR IGNORE INTO lesson_completions (lesson_id, user_id)
  SELECT id, 1 FROM lessons WHERE course_id = 2 AND sort <= 2;
INSERT OR IGNORE INTO lesson_completions (lesson_id, user_id)
  SELECT id, 2 FROM lessons WHERE course_id = 1 AND sort <= 3;
INSERT OR IGNORE INTO lesson_completions (lesson_id, user_id)
  SELECT id, 3 FROM lessons WHERE course_id = 1 AND sort = 1;
INSERT OR IGNORE INTO lesson_completions (lesson_id, user_id)
  SELECT id, 6 FROM lessons WHERE course_id = 2 AND sort <= 3;

INSERT OR IGNORE INTO rsvps (event_id, user_id) VALUES
  (1, 1), (1, 5), (1, 6),
  (2, 3), (2, 1),
  (3, 2);
