'use strict';

const { pool } = require('../db');

function mapStudent(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentNo: r.student_no,
    name: r.name,
    grade: r.grade,
    school: r.school,
    guardianName: r.guardian_name,
    guardianPhone: r.guardian_phone,
    allergies: r.allergies,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPlan(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    meals: r.meals,
    priceCents: r.price_cents,
    period: r.period,
    description: r.description,
    active: !!r.active,
    createdAt: r.created_at,
  };
}

function mapEnrollment(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    planId: r.plan_id,
    startDate: r.start_date,
    endDate: r.end_date,
    amountCents: r.amount_cents,
    paid: !!r.paid,
    status: r.status,
    createdAt: r.created_at,
  };
}

function mapMenu(r) {
  if (!r) return null;
  return {
    id: r.id,
    menuDate: r.menu_date,
    meal: r.meal,
    dishes: r.dishes,
    createdAt: r.created_at,
  };
}

function mapAttendance(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    attendDate: r.attend_date,
    meal: r.meal,
    status: r.status,
    pickedUpBy: r.picked_up_by,
    checkedAt: r.checked_at,
    remark: r.remark,
  };
}

function mapAllergen(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
  };
}

function mapStudentAllergen(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    allergenId: r.allergen_id,
    allergenName: r.allergen_name,
    severity: r.severity,
    createdAt: r.created_at,
  };
}

function mapDish(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapDishAllergen(r) {
  if (!r) return null;
  return {
    id: r.id,
    dishId: r.dish_id,
    allergenId: r.allergen_id,
    allergenName: r.allergen_name,
    createdAt: r.created_at,
  };
}

/* --------------------------- seed --------------------------- */

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'attendances', 'menu_dishes', 'dish_allergens', 'student_allergens',
      'daily_menus', 'dishes', 'allergens', 'enrollments', 'meal_plans', 'students',
    ]) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    await conn.query(
      `INSERT INTO students (id, student_no, name, grade, school, guardian_name, guardian_phone, allergies, status) VALUES
        (1,'XS2026001','小明','三年级','实验小学','王女士','13800001111','花生','ACTIVE'),
        (2,'XS2026002','小红','四年级','实验小学','李先生','13800002222','','ACTIVE'),
        (3,'XS2026003','小刚','二年级','中心小学','张女士','13800003333','海鲜','ACTIVE'),
        (4,'XS2026004','小丽','五年级','中心小学','赵先生','13800004444','','INACTIVE')`,
    );
    await conn.query(
      `INSERT INTO meal_plans (id, name, meals, price_cents, period, description, active) VALUES
        (1,'工作日午餐月套餐','LUNCH',60000,'MONTHLY','周一至周五午餐',1),
        (2,'午晚两餐月套餐','LUNCH,DINNER',99000,'MONTHLY','周一至周五午餐+晚餐含作业辅导',1),
        (3,'单日午餐','LUNCH',3000,'DAILY','临时单日午餐',1)`,
    );
    await conn.query(
      `INSERT INTO enrollments (id, student_id, plan_id, start_date, end_date, amount_cents, paid, status) VALUES
        (1,1,1,'2026-06-01','2026-06-30',60000,1,'ACTIVE'),
        (2,2,2,'2026-06-01','2026-06-30',99000,1,'ACTIVE'),
        (3,3,1,'2026-06-01','2026-06-30',60000,0,'ACTIVE')`,
    );
    await conn.query(
      `INSERT INTO daily_menus (id, menu_date, meal, dishes) VALUES
        (1,'2026-06-05','LUNCH','红烧鸡腿、清炒时蔬、紫菜蛋汤、米饭'),
        (2,'2026-06-05','DINNER','番茄牛腩、蒜蓉西兰花、米饭'),
        (3,'2026-06-06','LUNCH','糖醋里脊、麻婆豆腐、冬瓜汤、米饭')`,
    );
    await conn.query(
      `INSERT INTO allergens (id, name, description) VALUES
        (1,'花生','花生及相关制品'),
        (2,'海鲜','鱼虾蟹贝等海产品'),
        (3,'鸡蛋','鸡蛋及含蛋制品'),
        (4,'牛奶','牛奶及乳制品'),
        (5,'麸质','含麸质谷物（小麦、大麦等）'),
        (6,'大豆','大豆及豆制品'),
        (7,'坚果','树坚果（核桃、杏仁等）')`,
    );
    await conn.query(
      `INSERT INTO student_allergens (id, student_id, allergen_id, severity) VALUES
        (1,1,1,'FATAL'),
        (2,3,2,'SEVERE')`,
    );
    await conn.query(
      `INSERT INTO dishes (id, name, description) VALUES
        (1,'红烧鸡腿',''),
        (2,'清炒时蔬',''),
        (3,'紫菜蛋汤',''),
        (4,'米饭',''),
        (5,'番茄牛腩',''),
        (6,'蒜蓉西兰花',''),
        (7,'糖醋里脊',''),
        (8,'麻婆豆腐',''),
        (9,'冬瓜汤','')`,
    );
    await conn.query(
      `INSERT INTO dish_allergens (dish_id, allergen_id) VALUES
        (1,1),(1,5),(3,2),(3,3),(5,5),(7,3),(7,5),(8,5),(8,6)`,
    );
    await conn.query(
      `INSERT INTO menu_dishes (menu_id, dish_id) VALUES
        (1,1),(1,2),(1,3),(1,4),
        (2,5),(2,6),(2,4),
        (3,7),(3,8),(3,9),(3,4)`,
    );
    await conn.query(
      `INSERT INTO attendances (id, student_id, attend_date, meal, status, picked_up_by, remark) VALUES
        (1,1,'2026-06-05','LUNCH','PRESENT','','正常用餐'),
        (2,2,'2026-06-05','LUNCH','PRESENT','','正常用餐'),
        (3,3,'2026-06-05','LUNCH','ABSENT','','家长请假')`,
    );
  } finally {
    conn.release();
  }
}

/* ----------------------------- 学生 ----------------------------- */

async function listStudents({ status, school } = {}) {
  const where = [];
  const params = [];
  if (status !== undefined) { where.push('status = ?'); params.push(status); }
  if (school !== undefined) { where.push('school = ?'); params.push(school); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM students ${clause} ORDER BY id`, params);
  return rows.map(mapStudent);
}

async function getStudent(id) {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
  return mapStudent(rows[0]);
}

async function findStudentByNo(studentNo) {
  const [rows] = await pool.query('SELECT * FROM students WHERE student_no = ?', [studentNo]);
  return mapStudent(rows[0]);
}

async function createStudent(s) {
  const [r] = await pool.query(
    `INSERT INTO students (student_no, name, grade, school, guardian_name, guardian_phone, allergies, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.studentNo, s.name, s.grade || '', s.school || '', s.guardianName || '',
     s.guardianPhone || '', s.allergies || '', s.status || 'ACTIVE'],
  );
  return getStudent(r.insertId);
}

async function updateStudent(id, patch) {
  const map = {
    name: 'name', grade: 'grade', school: 'school',
    guardianName: 'guardian_name', guardianPhone: 'guardian_phone',
    allergies: 'allergies', status: 'status',
  };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) { sets.push(`${col} = ?`); params.push(patch[k]); }
  }
  if (sets.length) {
    sets.push('updated_at = CURRENT_TIMESTAMP(3)');
    params.push(id);
    await pool.query(`UPDATE students SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getStudent(id);
}

async function deleteStudent(id) {
  const [r] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 套餐 ----------------------------- */

async function listPlans({ activeOnly } = {}) {
  const clause = activeOnly ? 'WHERE active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM meal_plans ${clause} ORDER BY id`);
  return rows.map(mapPlan);
}

async function getPlan(id) {
  const [rows] = await pool.query('SELECT * FROM meal_plans WHERE id = ?', [id]);
  return mapPlan(rows[0]);
}

async function createPlan(p) {
  const [r] = await pool.query(
    `INSERT INTO meal_plans (name, meals, price_cents, period, description, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p.name, p.meals || 'LUNCH', p.priceCents || 0, p.period || 'MONTHLY',
     p.description || '', p.active === false ? 0 : 1],
  );
  return getPlan(r.insertId);
}

/* ----------------------------- 报名/订餐 ----------------------------- */

async function listEnrollments({ studentId } = {}) {
  if (studentId !== undefined) {
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = ? ORDER BY id', [studentId]);
    return rows.map(mapEnrollment);
  }
  const [rows] = await pool.query('SELECT * FROM enrollments ORDER BY id');
  return rows.map(mapEnrollment);
}

async function getEnrollment(id) {
  const [rows] = await pool.query('SELECT * FROM enrollments WHERE id = ?', [id]);
  return mapEnrollment(rows[0]);
}

async function createEnrollment(e) {
  const [r] = await pool.query(
    `INSERT INTO enrollments (student_id, plan_id, start_date, end_date, amount_cents, paid, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [e.studentId, e.planId, e.startDate, e.endDate, e.amountCents, e.paid ? 1 : 0, e.status || 'ACTIVE'],
  );
  return getEnrollment(r.insertId);
}

async function markEnrollmentPaid(id) {
  await pool.query('UPDATE enrollments SET paid = 1 WHERE id = ?', [id]);
  return getEnrollment(id);
}

/* ----------------------------- 菜单 ----------------------------- */

async function listMenus({ date } = {}) {
  if (date !== undefined) {
    const [rows] = await pool.query(
      'SELECT * FROM daily_menus WHERE menu_date = ? ORDER BY meal', [date]);
    return rows.map(mapMenu);
  }
  const [rows] = await pool.query('SELECT * FROM daily_menus ORDER BY menu_date DESC, meal');
  return rows.map(mapMenu);
}

async function findMenu(date, meal) {
  const [rows] = await pool.query(
    'SELECT * FROM daily_menus WHERE menu_date = ? AND meal = ?', [date, meal]);
  return mapMenu(rows[0]);
}

async function getMenuById(id) {
  const [rows] = await pool.query('SELECT * FROM daily_menus WHERE id = ?', [id]);
  return mapMenu(rows[0]);
}

async function upsertMenu(m) {
  await pool.query(
    `INSERT INTO daily_menus (menu_date, meal, dishes) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE dishes = VALUES(dishes)`,
    [m.menuDate, m.meal, m.dishes || ''],
  );
  return findMenu(m.menuDate, m.meal);
}

async function listMenuDishes(menuId) {
  const [rows] = await pool.query(
    `SELECT d.* FROM dishes d
     JOIN menu_dishes md ON md.dish_id = d.id
     WHERE md.menu_id = ?
     ORDER BY d.id`, [menuId]);
  return rows.map(mapDish);
}

async function setMenuDishes(menuId, dishIds) {
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM menu_dishes WHERE menu_id = ?', [menuId]);
    if (dishIds && dishIds.length) {
      const vals = dishIds.map(did => [menuId, did]);
      await conn.query(
        'INSERT INTO menu_dishes (menu_id, dish_id) VALUES ?',
        [vals],
      );
    }
  } finally {
    conn.release();
  }
}

/* ----------------------------- 出勤/签到 ----------------------------- */

async function listAttendances({ date, studentId } = {}) {
  const where = [];
  const params = [];
  if (date !== undefined) { where.push('attend_date = ?'); params.push(date); }
  if (studentId !== undefined) { where.push('student_id = ?'); params.push(studentId); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT * FROM attendances ${clause} ORDER BY attend_date DESC, id`, params);
  return rows.map(mapAttendance);
}

async function findAttendance(studentId, date, meal) {
  const [rows] = await pool.query(
    'SELECT * FROM attendances WHERE student_id = ? AND attend_date = ? AND meal = ?',
    [studentId, date, meal]);
  return mapAttendance(rows[0]);
}

async function createAttendance(a) {
  const [r] = await pool.query(
    `INSERT INTO attendances (student_id, attend_date, meal, status, picked_up_by, remark)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [a.studentId, a.attendDate, a.meal, a.status || 'PRESENT', a.pickedUpBy || '', a.remark || ''],
  );
  const [rows] = await pool.query('SELECT * FROM attendances WHERE id = ?', [r.insertId]);
  return mapAttendance(rows[0]);
}

/* ----------------------------- 过敏原字典 ----------------------------- */

async function listAllergens() {
  const [rows] = await pool.query('SELECT * FROM allergens ORDER BY id');
  return rows.map(mapAllergen);
}

async function getAllergen(id) {
  const [rows] = await pool.query('SELECT * FROM allergens WHERE id = ?', [id]);
  return mapAllergen(rows[0]);
}

async function createAllergen(a) {
  const [r] = await pool.query(
    'INSERT INTO allergens (name, description) VALUES (?, ?)',
    [a.name, a.description || ''],
  );
  return getAllergen(r.insertId);
}

async function updateAllergen(id, patch) {
  const sets = [];
  const params = [];
  if (patch.name !== undefined) { sets.push('name = ?'); params.push(patch.name); }
  if (patch.description !== undefined) { sets.push('description = ?'); params.push(patch.description); }
  if (sets.length) {
    params.push(id);
    await pool.query(`UPDATE allergens SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getAllergen(id);
}

async function deleteAllergen(id) {
  const [r] = await pool.query('DELETE FROM allergens WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 学生-过敏原 ----------------------------- */

async function listStudentAllergens(studentId) {
  const [rows] = await pool.query(
    `SELECT sa.*, a.name AS allergen_name
     FROM student_allergens sa
     JOIN allergens a ON a.id = sa.allergen_id
     WHERE sa.student_id = ?
     ORDER BY sa.id`, [studentId]);
  return rows.map(mapStudentAllergen);
}

async function addStudentAllergen(studentId, allergenId, severity) {
  const [r] = await pool.query(
    `INSERT INTO student_allergens (student_id, allergen_id, severity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE severity = VALUES(severity)`,
    [studentId, allergenId, severity || 'MILD'],
  );
  return listStudentAllergens(studentId);
}

async function removeStudentAllergen(studentId, allergenId) {
  await pool.query(
    'DELETE FROM student_allergens WHERE student_id = ? AND allergen_id = ?',
    [studentId, allergenId]);
}

async function setStudentAllergens(studentId, entries) {
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM student_allergens WHERE student_id = ?', [studentId]);
    if (entries && entries.length) {
      const vals = entries.map(e => [studentId, e.allergenId, e.severity || 'MILD']);
      await conn.query(
        'INSERT INTO student_allergens (student_id, allergen_id, severity) VALUES ?',
        [vals],
      );
    }
  } finally {
    conn.release();
  }
  return listStudentAllergens(studentId);
}

/* ----------------------------- 菜品 ----------------------------- */

async function listDishes() {
  const [rows] = await pool.query('SELECT * FROM dishes ORDER BY id');
  return rows.map(mapDish);
}

async function getDish(id) {
  const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
  return mapDish(rows[0]);
}

async function createDish(d) {
  const [r] = await pool.query(
    'INSERT INTO dishes (name, description) VALUES (?, ?)',
    [d.name, d.description || ''],
  );
  return getDish(r.insertId);
}

async function updateDish(id, patch) {
  const sets = [];
  const params = [];
  if (patch.name !== undefined) { sets.push('name = ?'); params.push(patch.name); }
  if (patch.description !== undefined) { sets.push('description = ?'); params.push(patch.description); }
  if (sets.length) {
    sets.push('updated_at = CURRENT_TIMESTAMP(3)');
    params.push(id);
    await pool.query(`UPDATE dishes SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getDish(id);
}

async function deleteDish(id) {
  const [r] = await pool.query('DELETE FROM dishes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 菜品-过敏原 ----------------------------- */

async function listDishAllergens(dishId) {
  const [rows] = await pool.query(
    `SELECT da.*, a.name AS allergen_name
     FROM dish_allergens da
     JOIN allergens a ON a.id = da.allergen_id
     WHERE da.dish_id = ?
     ORDER BY da.id`, [dishId]);
  return rows.map(mapDishAllergen);
}

async function setDishAllergens(dishId, allergenIds) {
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM dish_allergens WHERE dish_id = ?', [dishId]);
    if (allergenIds && allergenIds.length) {
      const vals = allergenIds.map(aid => [dishId, aid]);
      await conn.query(
        'INSERT INTO dish_allergens (dish_id, allergen_id) VALUES ?',
        [vals],
      );
    }
  } finally {
    conn.release();
  }
  return listDishAllergens(dishId);
}

/* ----------------------------- 冲突检测 ----------------------------- */

async function checkMenuConflicts(date, meal) {
  const [rows] = await pool.query(
    `SELECT
       s.id   AS student_id,
       s.name AS student_name,
       d.id   AS dish_id,
       d.name AS dish_name,
       a.id   AS allergen_id,
       a.name AS allergen_name,
       sa.severity
     FROM daily_menus dm
     JOIN menu_dishes md  ON md.menu_id  = dm.id
     JOIN dishes d        ON d.id        = md.dish_id
     JOIN dish_allergens da ON da.dish_id = d.id
     JOIN student_allergens sa ON sa.allergen_id = da.allergen_id
     JOIN students s      ON s.id        = sa.student_id
     JOIN allergens a     ON a.id        = sa.allergen_id
     WHERE dm.menu_date = ? AND dm.meal = ?
       AND s.status = 'ACTIVE'
     ORDER BY
       CASE sa.severity WHEN 'FATAL' THEN 0 WHEN 'SEVERE' THEN 1 WHEN 'MILD' THEN 2 END,
       s.id, d.id`,
    [date, meal],
  );

  const conflicts = rows.map(r => ({
    studentId: r.student_id,
    studentName: r.student_name,
    dishId: r.dish_id,
    dishName: r.dish_name,
    allergenId: r.allergen_id,
    allergenName: r.allergen_name,
    severity: r.severity,
  }));

  const fatalCount = conflicts.filter(c => c.severity === 'FATAL').length;
  const severeCount = conflicts.filter(c => c.severity === 'SEVERE').length;
  const mildCount = conflicts.filter(c => c.severity === 'MILD').length;

  const affectedStudentIds = [...new Set(conflicts.map(c => c.studentId))];
  const fatalStudentIds = [...new Set(conflicts.filter(c => c.severity === 'FATAL').map(c => c.studentId))];

  const warnings = [];
  if (fatalCount > 0) {
    warnings.push({
      level: 'CRITICAL',
      message: `存在 ${fatalCount} 项致命级过敏冲突，涉及 ${fatalStudentIds.length} 名学生，必须立即处理`,
    });
  }
  if (severeCount > 0) {
    warnings.push({
      level: 'WARNING',
      message: `存在 ${severeCount} 项严重级过敏冲突，涉及 ${affectedStudentIds.length} 名学生`,
    });
  }
  if (mildCount > 0) {
    warnings.push({
      level: 'INFO',
      message: `存在 ${mildCount} 项轻微级过敏冲突`,
    });
  }

  return {
    date,
    meal,
    conflictCount: conflicts.length,
    fatalCount,
    severeCount,
    mildCount,
    affectedStudentCount: affectedStudentIds.length,
    fatalStudentCount: fatalStudentIds.length,
    warnings,
    conflicts,
  };
}

async function checkStudentSafeMenu(studentId, date) {
  const student = await getStudent(studentId);
  if (!student) return null;

  const [menuRows] = await pool.query(
    'SELECT * FROM daily_menus WHERE menu_date = ? ORDER BY meal', [date]);

  const result = [];
  for (const menu of menuRows) {
    const [unsafeRows] = await pool.query(
      `SELECT DISTINCT d.id AS dish_id, d.name AS dish_name,
              a.id AS allergen_id, a.name AS allergen_name, sa.severity
       FROM menu_dishes md
       JOIN dishes d        ON d.id        = md.dish_id
       JOIN dish_allergens da ON da.dish_id = d.id
       JOIN student_allergens sa ON sa.allergen_id = da.allergen_id
       JOIN allergens a     ON a.id        = sa.allergen_id
       WHERE md.menu_id = ? AND sa.student_id = ?
       ORDER BY
         CASE sa.severity WHEN 'FATAL' THEN 0 WHEN 'SEVERE' THEN 1 WHEN 'MILD' THEN 2 END,
         d.id`,
      [menu.id, studentId],
    );

    const [safeRows] = await pool.query(
      `SELECT d.id, d.name
       FROM menu_dishes md
       JOIN dishes d ON d.id = md.dish_id
       WHERE md.menu_id = ?
         AND d.id NOT IN (
           SELECT DISTINCT da2.dish_id
           FROM dish_allergens da2
           JOIN student_allergens sa2 ON sa2.allergen_id = da2.allergen_id
           WHERE sa2.student_id = ?
         )
       ORDER BY d.id`,
      [menu.id, studentId],
    );

    const unsafeDishes = [];
    const seen = new Set();
    for (const r of unsafeRows) {
      const key = `${r.dish_id}_${r.allergen_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unsafeDishes.push({
          dishId: r.dish_id,
          dishName: r.dish_name,
          allergenId: r.allergen_id,
          allergenName: r.allergen_name,
          severity: r.severity,
        });
      }
    }

    const safeDishes = safeRows.map(r => ({
      dishId: r.id,
      dishName: r.name,
    }));

    const maxSeverity = unsafeDishes.length
      ? unsafeDishes.reduce((max, d) => {
          const order = { FATAL: 0, SEVERE: 1, MILD: 2 };
          return order[d.severity] < order[max] ? d.severity : max;
        }, 'MILD')
      : null;

    result.push({
      meal: menu.meal,
      menuId: menu.id,
      safeDishes,
      unsafeDishes,
      maxSeverity,
    });
  }

  return {
    studentId,
    studentName: student.name,
    date,
    meals: result,
  };
}

async function hasFatalConflict(studentId, date, meal) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM daily_menus dm
     JOIN menu_dishes md ON md.menu_id = dm.id
     JOIN dish_allergens da ON da.dish_id = md.dish_id
     JOIN student_allergens sa ON sa.allergen_id = da.allergen_id
     WHERE dm.menu_date = ? AND dm.meal = ?
       AND sa.student_id = ?
       AND sa.severity = 'FATAL'`,
    [date, meal, studentId],
  );
  return rows[0].cnt > 0;
}

async function getStudentConflictsForAttendance(studentId, date, meal) {
  const [rows] = await pool.query(
    `SELECT
       d.id   AS dish_id,
       d.name AS dish_name,
       a.id   AS allergen_id,
       a.name AS allergen_name,
       sa.severity
     FROM daily_menus dm
     JOIN menu_dishes md ON md.menu_id = dm.id
     JOIN dishes d        ON d.id = md.dish_id
     JOIN dish_allergens da ON da.dish_id = d.id
     JOIN student_allergens sa ON sa.allergen_id = da.allergen_id
     JOIN allergens a     ON a.id = sa.allergen_id
     WHERE dm.menu_date = ? AND dm.meal = ?
       AND sa.student_id = ?
     ORDER BY
       CASE sa.severity WHEN 'FATAL' THEN 0 WHEN 'SEVERE' THEN 1 WHEN 'MILD' THEN 2 END`,
    [date, meal, studentId],
  );
  return rows.map(r => ({
    dishId: r.dish_id,
    dishName: r.dish_name,
    allergenId: r.allergen_id,
    allergenName: r.allergen_name,
    severity: r.severity,
  }));
}

module.exports = {
  seed,
  listStudents, getStudent, findStudentByNo, createStudent, updateStudent, deleteStudent,
  listPlans, getPlan, createPlan,
  listEnrollments, getEnrollment, createEnrollment, markEnrollmentPaid,
  listMenus, findMenu, getMenuById, upsertMenu, listMenuDishes, setMenuDishes,
  listAttendances, findAttendance, createAttendance,
  listAllergens, getAllergen, createAllergen, updateAllergen, deleteAllergen,
  listStudentAllergens, addStudentAllergen, removeStudentAllergen, setStudentAllergens,
  listDishes, getDish, createDish, updateDish, deleteDish,
  listDishAllergens, setDishAllergens,
  checkMenuConflicts, checkStudentSafeMenu, hasFatalConflict, getStudentConflictsForAttendance,
};
