SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS students (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    student_no    VARCHAR(32)  NOT NULL,
    name          VARCHAR(64)  NOT NULL,
    grade         VARCHAR(32)  NOT NULL DEFAULT '',
    school        VARCHAR(128) NOT NULL DEFAULT '',
    guardian_name VARCHAR(64)  NOT NULL DEFAULT '',
    guardian_phone VARCHAR(20) NOT NULL DEFAULT '',
    allergies     VARCHAR(255) NOT NULL DEFAULT '',
    status        VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_students_no (student_no),
    KEY idx_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meal_plans (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    name         VARCHAR(64)  NOT NULL,
    meals        VARCHAR(64)  NOT NULL DEFAULT 'LUNCH',
    price_cents  INT          NOT NULL DEFAULT 0,
    period       VARCHAR(16)  NOT NULL DEFAULT 'MONTHLY',
    description  VARCHAR(500) NOT NULL DEFAULT '',
    active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    student_id   BIGINT       NOT NULL,
    plan_id      BIGINT       NOT NULL,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    amount_cents INT          NOT NULL DEFAULT 0,
    paid         TINYINT(1)   NOT NULL DEFAULT 0,
    status       VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_enroll_student (student_id),
    KEY idx_enroll_plan (plan_id),
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_plan FOREIGN KEY (plan_id) REFERENCES meal_plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_menus (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    menu_date   DATE         NOT NULL,
    meal        VARCHAR(16)  NOT NULL DEFAULT 'LUNCH',
    dishes      VARCHAR(1000) NOT NULL DEFAULT '',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_menu_date_meal (menu_date, meal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allergens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64)  NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_allergens_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_allergens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    student_id  BIGINT       NOT NULL,
    allergen_id BIGINT       NOT NULL,
    severity    VARCHAR(16)  NOT NULL DEFAULT 'MILD',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_allergen (student_id, allergen_id),
    KEY idx_sa_allergen (allergen_id),
    CONSTRAINT fk_sa_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_allergen FOREIGN KEY (allergen_id) REFERENCES allergens (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dishes (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_dishes_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dish_allergens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    dish_id     BIGINT       NOT NULL,
    allergen_id BIGINT       NOT NULL,
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_dish_allergen (dish_id, allergen_id),
    KEY idx_da_allergen (allergen_id),
    CONSTRAINT fk_da_dish FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
    CONSTRAINT fk_da_allergen FOREIGN KEY (allergen_id) REFERENCES allergens (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_dishes (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    menu_id     BIGINT       NOT NULL,
    dish_id     BIGINT       NOT NULL,
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_menu_dish (menu_id, dish_id),
    KEY idx_md_dish (dish_id),
    CONSTRAINT fk_md_menu FOREIGN KEY (menu_id) REFERENCES daily_menus (id) ON DELETE CASCADE,
    CONSTRAINT fk_md_dish FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendances (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    student_id   BIGINT       NOT NULL,
    attend_date  DATE         NOT NULL,
    meal         VARCHAR(16)  NOT NULL DEFAULT 'LUNCH',
    status       VARCHAR(16)  NOT NULL DEFAULT 'PRESENT',
    picked_up_by VARCHAR(64)  NOT NULL DEFAULT '',
    checked_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    remark       VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uk_attend (student_id, attend_date, meal),
    KEY idx_attend_date (attend_date),
    CONSTRAINT fk_attend_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
