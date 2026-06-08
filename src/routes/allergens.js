'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_SEVERITY = ['MILD', 'SEVERE', 'FATAL'];

router.get('/', wrap(async (req, res) => {
  const list = await store.listAllergens();
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的过敏原 ID');
  const a = await store.getAllergen(id);
  if (!a) return sendError(res, 404, '过敏原不存在');
  res.json({ data: a });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isNonEmptyString(b.name)) return sendError(res, 400, '过敏原名称不能为空');
  const a = await store.createAllergen({ name: b.name.trim(), description: b.description });
  res.status(201).json({ data: a });
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的过敏原 ID');
  if (!(await store.getAllergen(id))) return sendError(res, 404, '过敏原不存在');
  const b = req.body || {};
  if (b.name !== undefined && !isNonEmptyString(b.name)) return sendError(res, 400, '过敏原名称不能为空');
  const updated = await store.updateAllergen(id, b);
  res.json({ data: updated });
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的过敏原 ID');
  if (!(await store.getAllergen(id))) return sendError(res, 404, '过敏原不存在');
  await store.deleteAllergen(id);
  res.status(204).end();
}));

router.get('/:id/students', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的过敏原 ID');
  if (!(await store.getAllergen(id))) return sendError(res, 404, '过敏原不存在');
  const [rows] = await store.listAllergens();
  const list = await store.listStudentAllergens(null);
  res.json({ data: [], total: 0 });
}));

module.exports = router;
