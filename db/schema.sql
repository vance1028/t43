-- 学生小饭桌管理平台 - 表结构（MySQL）

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
