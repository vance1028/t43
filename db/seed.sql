SET NAMES utf8mb4;

INSERT IGNORE INTO students (id, student_no, name, grade, school, guardian_name, guardian_phone, allergies, status) VALUES
  (1, 'XS2026001', '小明', '三年级', '实验小学', '王女士', '13800001111', '花生', 'ACTIVE'),
  (2, 'XS2026002', '小红', '四年级', '实验小学', '李先生', '13800002222', '', 'ACTIVE'),
  (3, 'XS2026003', '小刚', '二年级', '中心小学', '张女士', '13800003333', '海鲜', 'ACTIVE'),
  (4, 'XS2026004', '小丽', '五年级', '中心小学', '赵先生', '13800004444', '', 'INACTIVE');

INSERT IGNORE INTO meal_plans (id, name, meals, price_cents, period, description, active) VALUES
  (1, '工作日午餐月套餐', 'LUNCH', 60000, 'MONTHLY', '周一至周五午餐', 1),
  (2, '午晚两餐月套餐', 'LUNCH,DINNER', 99000, 'MONTHLY', '周一至周五午餐+晚餐含作业辅导', 1),
  (3, '单日午餐', 'LUNCH', 3000, 'DAILY', '临时单日午餐', 1);

INSERT IGNORE INTO enrollments (id, student_id, plan_id, start_date, end_date, amount_cents, paid, status) VALUES
  (1, 1, 1, '2026-06-01', '2026-06-30', 60000, 1, 'ACTIVE'),
  (2, 2, 2, '2026-06-01', '2026-06-30', 99000, 1, 'ACTIVE'),
  (3, 3, 1, '2026-06-01', '2026-06-30', 60000, 0, 'ACTIVE');

INSERT IGNORE INTO daily_menus (id, menu_date, meal, dishes) VALUES
  (1, '2026-06-05', 'LUNCH', '红烧鸡腿、清炒时蔬、紫菜蛋汤、米饭'),
  (2, '2026-06-05', 'DINNER', '番茄牛腩、蒜蓉西兰花、米饭'),
  (3, '2026-06-06', 'LUNCH', '糖醋里脊、麻婆豆腐、冬瓜汤、米饭');

INSERT IGNORE INTO allergens (id, name, description) VALUES
  (1, '花生', '花生及相关制品'),
  (2, '海鲜', '鱼虾蟹贝等海产品'),
  (3, '鸡蛋', '鸡蛋及含蛋制品'),
  (4, '牛奶', '牛奶及乳制品'),
  (5, '麸质', '含麸质谷物（小麦、大麦等）'),
  (6, '大豆', '大豆及豆制品'),
  (7, '坚果', '树坚果（核桃、杏仁等）');

INSERT IGNORE INTO student_allergens (id, student_id, allergen_id, severity) VALUES
  (1, 1, 1, 'FATAL'),
  (2, 3, 2, 'SEVERE');

INSERT IGNORE INTO dishes (id, name, description) VALUES
  (1,  '红烧鸡腿',   ''),
  (2,  '清炒时蔬',   ''),
  (3,  '紫菜蛋汤',   ''),
  (4,  '米饭',       ''),
  (5,  '番茄牛腩',   ''),
  (6,  '蒜蓉西兰花', ''),
  (7,  '糖醋里脊',   ''),
  (8,  '麻婆豆腐',   ''),
  (9,  '冬瓜汤',     '');

INSERT IGNORE INTO dish_allergens (dish_id, allergen_id) VALUES
  (1, 1),
  (1, 5),
  (3, 2),
  (3, 3),
  (5, 5),
  (7, 3),
  (7, 5),
  (8, 5),
  (8, 6);

INSERT IGNORE INTO menu_dishes (menu_id, dish_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 5),
  (2, 6),
  (2, 4),
  (3, 7),
  (3, 8),
  (3, 9),
  (3, 4);

INSERT IGNORE INTO attendances (id, student_id, attend_date, meal, status, picked_up_by, remark) VALUES
  (1, 1, '2026-06-05', 'LUNCH', 'PRESENT', '', '正常用餐'),
  (2, 2, '2026-06-05', 'LUNCH', 'PRESENT', '', '正常用餐'),
  (3, 3, '2026-06-05', 'LUNCH', 'ABSENT', '', '家长请假');
