INSERT INTO public.questions (
  test_id,
  domain,
  content,
  selection_count,
  "index"
) VALUES
  -- 1 ~ 9 : Anxiety
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나를 정말로 사랑하지 않을까 걱정한다.', 7, 1),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나를 떠날까 봐 자주 불안해한다.', 7, 2),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나에게 충분히 가까이 오지 않는다고 느낀다.', 7, 3),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나보다 나를 덜 사랑할까 봐 걱정된다.', 7, 4),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나를 덜 중요하게 여길까 걱정된다.', 7, 5),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나에 대해 충분히 애정을 표현하지 않는다고 느낀다.', 7, 6),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 내 곁을 떠날까 봐 자주 걱정한다.', 7, 7),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나보다 다른 사람에게 더 관심이 있을까 봐 걱정한다.', 7, 8),
  ('adult-attachment', 'Anxiety', '나는 상대방(이성)이 나를 거절할까 봐 두렵다.', 7, 9),

  -- 10 ~ 18 : Avoidance
  ('adult-attachment', 'Avoidance', '나는 상대방(이성)에게 내 속마음을 털어놓는 것이 불편하다.', 7, 10),
  ('adult-attachment', 'Avoidance', '나는 누군가에게 의지하는 것이 어렵다.', 7, 11),
  ('adult-attachment', 'Avoidance', '나는 상대방(이성)에게 내 감정을 보이는 것이 두렵다.', 7, 12),
  ('adult-attachment', 'Avoidance', '나는 상대방(이성)과 감정적으로 가까워지는 것을 꺼린다.', 7, 13),
  ('adult-attachment', 'Avoidance', '나는 감정적인 친밀함보다 독립적인 것이 더 편하다.', 7, 14),
  ('adult-attachment', 'Avoidance', '나는 개인적인 어려움을 혼자 해결하려는 경향이 있다.', 7, 15),
  ('adult-attachment', 'Avoidance', '나는 누군가와 너무 가까워지는 것이 부담스럽다.', 7, 16),
  ('adult-attachment', 'Avoidance', '나는 감정적으로 고립되는 것이 더 안전하다고 느낀다.', 7, 17),
  ('adult-attachment', 'Avoidance', '나는 상대방(이성)이 내 감정에 너무 깊이 관여하는 것이 불편하다.', 7, 18);

-- 🔵 Openness (7개) → index 19~25
INSERT INTO questions (test_id, domain, content, selection_count, index)
VALUES
('big-5', 'Openness', '나는 새로운 아이디어에 열려 있다.', 5, 19),
('big-5', 'Openness', '예술과 음악을 감상하는 것을 좋아한다.', 5, 20),
('big-5', 'Openness', '상상력이 풍부한 편이다.', 5, 21),
('big-5', 'Openness', '다양한 문화를 탐색하는 걸 좋아한다.', 5, 22),
('big-5', 'Openness', '철학적인 주제에 관심이 있다.', 5, 23),
('big-5', 'Openness', '전통보다 새로운 방식을 좋아한다.', 5, 24),
('big-5', 'Openness', '창의적인 활동에 흥미를 느낀다.', 5, 25);

-- 🟠 Conscientiousness (6개) → index 26~31
INSERT INTO questions (test_id, domain, content, selection_count, index)
VALUES
('big-5', 'Conscientiousness', '계획을 잘 세우고 따르는 편이다.', 5, 26),
('big-5', 'Conscientiousness', '정리 정돈을 잘 한다.', 5, 27),
('big-5', 'Conscientiousness', '충동적으로 행동하지 않는다.', 5, 28),
('big-5', 'Conscientiousness', '실수를 줄이려고 노력한다.', 5, 29),
('big-5', 'Conscientiousness', '집중력이 있는 편이다.', 5, 30),
('big-5', 'Conscientiousness', '목표를 향해 꾸준히 노력한다.', 5, 31);

-- 🟡 Extraversion (7개) → index 32~38
INSERT INTO questions (test_id, domain, content, selection_count, index)
VALUES
('big-5', 'Extraversion', '새로운 사람과 쉽게 친구가 된다.', 5, 32),
('big-5', 'Extraversion', '말이 많은 편이다.', 5, 33),
('big-5', 'Extraversion', '활력이 넘친다.', 5, 34),
('big-5', 'Extraversion', '주목받는 것을 좋아한다.', 5, 35),
('big-5', 'Extraversion', '혼자보다는 같이 있는 걸 선호한다.', 5, 36),
('big-5', 'Extraversion', '주변을 웃기거나 즐겁게 한다.', 5, 37),
('big-5', 'Extraversion', '쉽게 열정적으로 변한다.', 5, 38);

-- 🟢 Agreeableness (6개) → index 39~44
INSERT INTO questions (test_id, domain, content, selection_count, index)
VALUES
('big-5', 'Agreeableness', '다정하고 따뜻한 편이다.', 5, 39),
('big-5', 'Agreeableness', '잘 용서하는 편이다.', 5, 40),
('big-5', 'Agreeableness', '갈등을 피하려 한다.', 5, 41),
('big-5', 'Agreeableness', '다른 사람을 잘 믿는 편이다.', 5, 42),
('big-5', 'Agreeableness', '다른 사람을 배려하는 편이다.', 5, 43),
('big-5', 'Agreeableness', '타인의 감정에 공감한다.', 5, 44);

-- 🔴 Neuroticism (7개) → index 45~51
INSERT INTO questions (test_id, domain, content, selection_count, index)
VALUES
('big-5', 'Neuroticism', '비판에 민감하게 반응한다.', 5, 45),
('big-5', 'Neuroticism', '걱정을 자주 한다.', 5, 46),
('big-5', 'Neuroticism', '자신에 대해 부정적으로 느낀다.', 5, 47),
('big-5', 'Neuroticism', '긴장을 자주 한다.', 5, 48),
('big-5', 'Neuroticism', '사소한 일에도 불안해진다.', 5, 49),
('big-5', 'Neuroticism', '자주 스트레스를 받는다.', 5, 50),
('big-5', 'Neuroticism', '감정 기복이 심하다.', 5, 51);

-- 52. Humor
INSERT INTO public.questions (test_id, domain, content, selection_count, index)
VALUES ('flexibility', 'Humor', '나는 사람들을 웃기는것을 즐긴다.', 7, 52);

-- 53. Humor
INSERT INTO public.questions (test_id, domain, content, selection_count, index)
VALUES ('flexibility', 'Humor', '혼자 있을때에도 삶의 부조리/어이없음/예측불허에 자주 실소·즐거움·행복을 느낀다.', 7, 53);

-- 54. Conflict
INSERT INTO public.questions (test_id, domain, content, selection_count, index)
VALUES ('flexibility', 'Conflict', '두 사람 모두 수용 가능한 해결책을 찾아보려 노력한다.', 7, 54);

-- 55. Conflict
INSERT INTO public.questions (test_id, domain, content, selection_count, index)
VALUES ('flexibility', 'Conflict', '나는 보통 상대가 원하는 대로 문제 해결을 하려고 하는 편이다.', 7, 55);