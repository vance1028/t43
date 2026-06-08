'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_STATUS = ['ACTIVE', 'INACTIVE'];
const VALID_SEVERITY = ['MILD', 'SEVERE', 'FATAL'];

router.get('/', wrap(async (req, res) => {
  const { status, school } = req.query;
  const filters = {};
  if (status !== undefined) {
    if (!VALID_STATUS.includes(status)) return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
    filters.status = status;
  }
  if (isNonEmptyString(school)) filters.school = school.trim();
  const list = await store.listStudents(filters);
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  const s = await store.getStudent(id);
  if (!s) return sendError(res, 404, '学生不存在');
  const allergens = await store.listStudentAllergens(id);
  res.json({ data: { ...s, allergenDetails: allergens } });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isNonEmptyString(b.studentNo)) return sendError(res, 400, '学号不能为空');
  if (!isNonEmptyString(b.name)) return sendError(res, 400, '姓名不能为空');
  if (b.status !== undefined && !VALID_STATUS.includes(b.status)) {
    return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
  }
  if (await store.findStudentByNo(b.studentNo.trim())) {
    return sendError(res, 409, '学号已存在');
  }
  const s = await store.createStudent({ ...b, studentNo: b.studentNo.trim(), name: b.name.trim() });

  if (Array.isArray(b.allergens)) {
    const entries = b.allergens
      .filter(a => a.allergenId && VALID_SEVERITY.includes(a.severity))
      .map(a => ({ allergenId: a.allergenId, severity: a.severity || 'MILD' }));
    if (entries.length) {
      await store.setStudentAllergens(s.id, entries);
    }
  }

  const result = await store.getStudent(s.id);
  const allergens = await store.listStudentAllergens(s.id);
  res.status(201).json({ data: { ...result, allergenDetails: allergens } });
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  const b = req.body || {};
  if (b.name !== undefined && !isNonEmptyString(b.name)) return sendError(res, 400, '姓名不能为空');
  if (b.status !== undefined && !VALID_STATUS.includes(b.status)) {
    return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
  }
  const updated = await store.updateStudent(id, b);

  if (Array.isArray(b.allergens)) {
    const entries = b.allergens
      .filter(a => a.allergenId && VALID_SEVERITY.includes(a.severity))
      .map(a => ({ allergenId: a.allergenId, severity: a.severity || 'MILD' }));
    await store.setStudentAllergens(id, entries);
  }

  const result = await store.getStudent(id);
  const allergens = await store.listStudentAllergens(id);
  res.json({ data: { ...result, allergenDetails: allergens } });
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  await store.deleteStudent(id);
  res.status(204).end();
}));

router.get('/:id/allergens', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  const allergens = await store.listStudentAllergens(id);
  res.json({ data: allergens, total: allergens.length });
}));

router.post('/:id/allergens', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  const b = req.body || {};
  const allergenId = toPositiveInt(b.allergenId);
  if (allergenId === null) return sendError(res, 400, '必须指定有效的过敏原 ID');
  if (!(await store.getAllergen(allergenId))) return sendError(res, 400, '过敏原不存在');
  const severity = b.severity || 'MILD';
  if (!VALID_SEVERITY.includes(severity)) return sendError(res, 400, `严重程度只能是 ${VALID_SEVERITY.join(' / ')}`);
  const allergens = await store.addStudentAllergen(id, allergenId, severity);
  res.status(201).json({ data: allergens });
}));

router.put('/:id/allergens', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  const b = req.body || {};
  if (!Array.isArray(b.allergens)) return sendError(res, 400, 'allergens 必须是数组');
  const entries = b.allergens
    .filter(a => a.allergenId && VALID_SEVERITY.includes(a.severity))
    .map(a => ({ allergenId: a.allergenId, severity: a.severity || 'MILD' }));
  const allergens = await store.setStudentAllergens(id, entries);
  res.json({ data: allergens });
}));

router.delete('/:id/allergens/:allergenId', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  const allergenId = toPositiveInt(req.params.allergenId);
  if (id === null) return sendError(res, 400, '无效的学生 ID');
  if (allergenId === null) return sendError(res, 400, '无效的过敏原 ID');
  if (!(await store.getStudent(id))) return sendError(res, 404, '学生不存在');
  await store.removeStudentAllergen(id, allergenId);
  res.status(204).end();
}));

module.exports = router;
