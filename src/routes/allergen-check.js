'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, toPositiveInt, isValidDate } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_SEVERITY = ['MILD', 'SEVERE', 'FATAL'];

router.get('/menu-conflicts', wrap(async (req, res) => {
  const { date, meal } = req.query;
  if (!isValidDate(date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
  if (!meal) return sendError(res, 400, '必须指定餐次');
  const menu = await store.findMenu(date, meal);
  if (!menu) return sendError(res, 404, '该日期餐次没有菜单');
  const result = await store.checkMenuConflicts(date, meal);
  res.json({ data: result });
}));

router.get('/student-safe', wrap(async (req, res) => {
  const { studentId, date } = req.query;
  const sid = toPositiveInt(studentId);
  if (sid === null) return sendError(res, 400, '必须指定有效的学生 ID');
  if (!isValidDate(date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
  const result = await store.checkStudentSafeMenu(sid, date);
  if (!result) return sendError(res, 404, '学生不存在');
  res.json({ data: result });
}));

router.get('/attendance-conflicts', wrap(async (req, res) => {
  const { studentId, date, meal } = req.query;
  const sid = toPositiveInt(studentId);
  if (sid === null) return sendError(res, 400, '必须指定有效的学生 ID');
  if (!isValidDate(date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
  if (!meal) return sendError(res, 400, '必须指定餐次');
  const conflicts = await store.getStudentConflictsForAttendance(sid, date, meal);
  const hasFatal = conflicts.some(c => c.severity === 'FATAL');
  res.json({
    data: {
      studentId: sid,
      date,
      meal,
      hasFatalConflict: hasFatal,
      conflictCount: conflicts.length,
      conflicts,
    },
  });
}));

module.exports = router;
