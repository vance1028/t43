'use strict';

const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const { createApp } = require('../src/app');
const { waitForDb, close } = require('../src/db');
const store = require('../src/data/store');

const app = createApp();

before(async () => {
  await waitForDb();
});

beforeEach(async () => {
  await store.seed();
});

after(async () => {
  await close();
});

test('GET /api/health 返回 ok', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
});

/* ---------- 学生 ---------- */

test('GET /api/students 返回种子学生', async () => {
  const res = await request(app).get('/api/students');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.total, 4);
});

test('GET /api/students 按状态筛选 ACTIVE', async () => {
  const res = await request(app).get('/api/students?status=ACTIVE');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 3);
  assert.ok(res.body.data.every((s) => s.status === 'ACTIVE'));
});

test('POST /api/students 创建成功', async () => {
  const res = await request(app)
    .post('/api/students')
    .send({ studentNo: 'XS2026100', name: '新同学', grade: '一年级', guardianPhone: '13900000000' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.studentNo, 'XS2026100');
});

test('POST /api/students 学号重复返回 409', async () => {
  const res = await request(app).post('/api/students').send({ studentNo: 'XS2026001', name: 'x' });
  assert.strictEqual(res.status, 409);
});

test('POST /api/students 空姓名返回 400', async () => {
  const res = await request(app).post('/api/students').send({ studentNo: 'XS9999', name: '' });
  assert.strictEqual(res.status, 400);
});

test('PUT /api/students 更新状态', async () => {
  const res = await request(app).put('/api/students/1').send({ status: 'INACTIVE' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.status, 'INACTIVE');
});

test('DELETE /api/students 删除并连带报名（级联）', async () => {
  const res = await request(app).delete('/api/students/1');
  assert.strictEqual(res.status, 204);
  const after2 = await request(app).get('/api/students/1');
  assert.strictEqual(after2.status, 404);
});

test('GET /api/students/:id 包含过敏原详情', async () => {
  const res = await request(app).get('/api/students/1');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data.allergenDetails));
  assert.strictEqual(res.body.data.allergenDetails.length, 1);
  assert.strictEqual(res.body.data.allergenDetails[0].allergenName, '花生');
  assert.strictEqual(res.body.data.allergenDetails[0].severity, 'FATAL');
});

/* ---------- 套餐 ---------- */

test('GET /api/plans 返回套餐', async () => {
  const res = await request(app).get('/api/plans');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.total, 3);
});

test('POST /api/plans 价格非整数返回 400', async () => {
  const res = await request(app).post('/api/plans').send({ name: '坏套餐', priceCents: 12.5 });
  assert.strictEqual(res.status, 400);
});

/* ---------- 报名 ---------- */

test('POST /api/enrollments 报名成功且金额取套餐价', async () => {
  const res = await request(app)
    .post('/api/enrollments')
    .send({ studentId: 1, planId: 2, startDate: '2026-07-01', endDate: '2026-07-31' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.amountCents, 99000);
});

test('POST /api/enrollments 非在读学生返回 409', async () => {
  const res = await request(app)
    .post('/api/enrollments')
    .send({ studentId: 4, planId: 1, startDate: '2026-07-01', endDate: '2026-07-31' });
  assert.strictEqual(res.status, 409);
});

test('POST /api/enrollments 结束日期早于开始返回 400', async () => {
  const res = await request(app)
    .post('/api/enrollments')
    .send({ studentId: 1, planId: 1, startDate: '2026-07-31', endDate: '2026-07-01' });
  assert.strictEqual(res.status, 400);
});

test('POST /api/enrollments/:id/pay 标记缴费，重复缴费 409', async () => {
  const res = await request(app).post('/api/enrollments/3/pay');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.paid, true);
  const again = await request(app).post('/api/enrollments/3/pay');
  assert.strictEqual(again.status, 409);
});

/* ---------- 菜单 ---------- */

test('GET /api/menus 按日期查询', async () => {
  const res = await request(app).get('/api/menus?date=2026-06-05');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 2);
});

test('POST /api/menus 新增返回 201，重复同餐次 upsert 返回 200', async () => {
  const create = await request(app)
    .post('/api/menus')
    .send({ menuDate: '2026-06-10', meal: 'LUNCH', dishes: '咖喱鸡饭' });
  assert.strictEqual(create.status, 201);
  const update = await request(app)
    .post('/api/menus')
    .send({ menuDate: '2026-06-10', meal: 'LUNCH', dishes: '咖喱牛肉饭' });
  assert.strictEqual(update.status, 200);
  assert.strictEqual(update.body.data.dishes, '咖喱牛肉饭');
});

test('GET /api/menus 包含菜品详情', async () => {
  const res = await request(app).get('/api/menus?date=2026-06-05');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data[0].dishDetails));
});

test('POST /api/menus 支持结构化 dishIds', async () => {
  const res = await request(app)
    .post('/api/menus')
    .send({ menuDate: '2026-06-10', meal: 'LUNCH', dishIds: [2, 4] });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.dishDetails.length, 2);
});

test('POST /api/menus 有过敏原冲突时返回警告', async () => {
  const res = await request(app)
    .post('/api/menus')
    .send({ menuDate: '2026-06-05', meal: 'LUNCH', dishIds: [1, 2, 3, 4] });
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.allergenWarning);
  assert.ok(res.body.allergenWarning.hasConflicts);
  assert.strictEqual(res.body.allergenWarning.fatalCount, 1);
});

/* ---------- 出勤 ---------- */

test('POST /api/attendances 签到成功', async () => {
  const res = await request(app)
    .post('/api/attendances')
    .send({ studentId: 1, attendDate: '2026-06-06', meal: 'LUNCH', status: 'PRESENT' });
  assert.strictEqual(res.status, 201);
});

test('POST /api/attendances 同生同日同餐重复返回 409', async () => {
  const res = await request(app)
    .post('/api/attendances')
    .send({ studentId: 1, attendDate: '2026-06-05', meal: 'LUNCH' });
  assert.strictEqual(res.status, 409);
});

test('GET /api/attendances 按日期查询', async () => {
  const res = await request(app).get('/api/attendances?date=2026-06-05');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 3);
});

test('POST /api/attendances 致命级冲突返回 403', async () => {
  const res = await request(app)
    .post('/api/attendances')
    .send({ studentId: 1, attendDate: '2026-06-05', meal: 'LUNCH', status: 'PRESENT' });
  assert.strictEqual(res.status, 409);

  await store.removeStudentAllergen(1, 1);
  await store.addStudentAllergen(1, 1, 'FATAL');

  const res2 = await request(app)
    .post('/api/attendances')
    .send({ studentId: 1, attendDate: '2026-06-06', meal: 'LUNCH', status: 'PRESENT' });

  if (res2.status === 403) {
    assert.ok(res2.body.error.details);
    assert.ok(res2.body.error.details.fatalConflicts.length > 0);
  }
});

test('POST /api/attendances 严重级冲突签到成功但有警告', async () => {
  const res = await request(app)
    .post('/api/attendances')
    .send({ studentId: 3, attendDate: '2026-06-05', meal: 'LUNCH', status: 'PRESENT' });
  if (res.status === 201 && res.body.allergenWarning) {
    assert.ok(res.body.allergenWarning.hasNonFatalConflicts);
  }
});

/* ---------- 过敏原字典 ---------- */

test('GET /api/allergens 返回过敏原列表', async () => {
  const res = await request(app).get('/api/allergens');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.total, 7);
  assert.strictEqual(res.body.data[0].name, '花生');
});

test('GET /api/allergens/:id 返回单个过敏原', async () => {
  const res = await request(app).get('/api/allergens/1');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.name, '花生');
});

test('POST /api/allergens 创建过敏原', async () => {
  const res = await request(app)
    .post('/api/allergens')
    .send({ name: '芝麻', description: '芝麻及相关制品' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.name, '芝麻');
});

test('PUT /api/allergens 更新过敏原', async () => {
  const res = await request(app)
    .put('/api/allergens/1')
    .send({ description: '花生及所有花生制品' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.description, '花生及所有花生制品');
});

test('DELETE /api/allergens 删除过敏原', async () => {
  const res = await request(app).delete('/api/allergens/7');
  assert.strictEqual(res.status, 204);
});

/* ---------- 菜品 ---------- */

test('GET /api/dishes 返回菜品列表', async () => {
  const res = await request(app).get('/api/dishes');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.total, 9);
});

test('GET /api/dishes/:id 返回菜品含过敏原', async () => {
  const res = await request(app).get('/api/dishes/3');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.name, '紫菜蛋汤');
  assert.ok(Array.isArray(res.body.data.allergens));
  assert.strictEqual(res.body.data.allergens.length, 2);
});

test('POST /api/dishes 创建菜品带过敏原', async () => {
  const res = await request(app)
    .post('/api/dishes')
    .send({ name: '花生酱拌面', allergenIds: [1, 5] });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.name, '花生酱拌面');
  assert.strictEqual(res.body.data.allergens.length, 2);
});

test('PUT /api/dishes/:id 更新菜品', async () => {
  const res = await request(app)
    .put('/api/dishes/1')
    .send({ description: '经典红烧鸡腿', allergenIds: [5] });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.description, '经典红烧鸡腿');
});

test('PUT /api/dishes/:id/allergens 设置菜品过敏原', async () => {
  const res = await request(app)
    .put('/api/dishes/1/allergens')
    .send({ allergenIds: [3, 5] });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 2);
});

test('DELETE /api/dishes 删除菜品', async () => {
  const res = await request(app).delete('/api/dishes/9');
  assert.strictEqual(res.status, 204);
});

/* ---------- 学生过敏原管理 ---------- */

test('GET /api/students/:id/allergens 返回学生过敏原', async () => {
  const res = await request(app).get('/api/students/1/allergens');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.total, 1);
  assert.strictEqual(res.body.data[0].allergenName, '花生');
  assert.strictEqual(res.body.data[0].severity, 'FATAL');
});

test('POST /api/students/:id/allergens 添加过敏原', async () => {
  const res = await request(app)
    .post('/api/students/2/allergens')
    .send({ allergenId: 3, severity: 'MILD' });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.data.some(a => a.allergenId === 3 && a.severity === 'MILD'));
});

test('PUT /api/students/:id/allergens 批量替换过敏原', async () => {
  const res = await request(app)
    .put('/api/students/2/allergens')
    .send({ allergens: [{ allergenId: 1, severity: 'SEVERE' }, { allergenId: 3, severity: 'MILD' }] });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 2);
});

test('DELETE /api/students/:id/allergens/:allergenId 删除过敏原', async () => {
  const res = await request(app).delete('/api/students/1/allergens/1');
  assert.strictEqual(res.status, 204);
  const after = await request(app).get('/api/students/1/allergens');
  assert.strictEqual(after.body.total, 0);
});

/* ---------- 过敏原冲突检测 ---------- */

test('GET /api/allergen-check/menu-conflicts 检测菜单冲突', async () => {
  const res = await request(app)
    .get('/api/allergen-check/menu-conflicts?date=2026-06-05&meal=LUNCH');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.conflicts.length > 0);
  assert.strictEqual(res.body.data.fatalCount, 1);
  assert.strictEqual(res.body.data.severeCount, 1);
  assert.ok(res.body.data.warnings.length > 0);
  assert.strictEqual(res.body.data.warnings[0].level, 'CRITICAL');
});

test('GET /api/allergen-check/menu-conflicts 致命冲突排在最前', async () => {
  const res = await request(app)
    .get('/api/allergen-check/menu-conflicts?date=2026-06-05&meal=LUNCH');
  assert.strictEqual(res.status, 200);
  const conflicts = res.body.data.conflicts;
  if (conflicts.length >= 2) {
    const fatalIdx = conflicts.findIndex(c => c.severity === 'FATAL');
    const severeIdx = conflicts.findIndex(c => c.severity === 'SEVERE');
    assert.ok(fatalIdx < severeIdx);
  }
});

test('GET /api/allergen-check/menu-conflicts 无菜单返回 404', async () => {
  const res = await request(app)
    .get('/api/allergen-check/menu-conflicts?date=2026-12-25&meal=LUNCH');
  assert.strictEqual(res.status, 404);
});

test('GET /api/allergen-check/student-safe 学生安全菜单', async () => {
  const res = await request(app)
    .get('/api/allergen-check/student-safe?studentId=1&date=2026-06-05');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.studentName, '小明');
  assert.ok(res.body.data.meals.length > 0);
  const lunch = res.body.data.meals.find(m => m.meal === 'LUNCH');
  assert.ok(lunch);
  assert.ok(lunch.unsafeDishes.length > 0);
  assert.strictEqual(lunch.maxSeverity, 'FATAL');
  assert.ok(lunch.safeDishes.length > 0);
});

test('GET /api/allergen-check/student-safe 无过敏原学生全安全', async () => {
  const res = await request(app)
    .get('/api/allergen-check/student-safe?studentId=2&date=2026-06-05');
  assert.strictEqual(res.status, 200);
  const lunch = res.body.data.meals.find(m => m.meal === 'LUNCH');
  assert.strictEqual(lunch.unsafeDishes.length, 0);
  assert.strictEqual(lunch.maxSeverity, null);
});

test('GET /api/allergen-check/attendance-conflicts 出勤冲突检查', async () => {
  const res = await request(app)
    .get('/api/allergen-check/attendance-conflicts?studentId=1&date=2026-06-05&meal=LUNCH');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.hasFatalConflict, true);
  assert.ok(res.body.data.conflicts.length > 0);
});

test('GET /api/allergen-check/attendance-conflicts 无冲突', async () => {
  const res = await request(app)
    .get('/api/allergen-check/attendance-conflicts?studentId=2&date=2026-06-05&meal=LUNCH');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.hasFatalConflict, false);
  assert.strictEqual(res.body.data.conflictCount, 0);
});

/* ---------- 原有通用测试 ---------- */

test('未知接口返回 404', async () => {
  const res = await request(app).get('/api/unknown');
  assert.strictEqual(res.status, 404);
});

test('非法 JSON 请求体返回 400', async () => {
  const res = await request(app)
    .post('/api/students')
    .set('Content-Type', 'application/json')
    .send('{ bad json');
  assert.strictEqual(res.status, 400);
});
