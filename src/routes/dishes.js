'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(async (req, res) => {
  const list = await store.listDishes();
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的菜品 ID');
  const d = await store.getDish(id);
  if (!d) return sendError(res, 404, '菜品不存在');
  const allergens = await store.listDishAllergens(id);
  res.json({ data: { ...d, allergens } });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isNonEmptyString(b.name)) return sendError(res, 400, '菜品名称不能为空');
  const d = await store.createDish({ name: b.name.trim(), description: b.description });
  if (Array.isArray(b.allergenIds)) {
    await store.setDishAllergens(d.id, b.allergenIds);
  }
  const result = await store.getDish(d.id);
  const allergens = await store.listDishAllergens(d.id);
  res.status(201).json({ data: { ...result, allergens } });
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的菜品 ID');
  if (!(await store.getDish(id))) return sendError(res, 404, '菜品不存在');
  const b = req.body || {};
  if (b.name !== undefined && !isNonEmptyString(b.name)) return sendError(res, 400, '菜品名称不能为空');
  await store.updateDish(id, b);
  if (Array.isArray(b.allergenIds)) {
    await store.setDishAllergens(id, b.allergenIds);
  }
  const result = await store.getDish(id);
  const allergens = await store.listDishAllergens(id);
  res.json({ data: { ...result, allergens } });
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的菜品 ID');
  if (!(await store.getDish(id))) return sendError(res, 404, '菜品不存在');
  await store.deleteDish(id);
  res.status(204).end();
}));

router.put('/:id/allergens', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的菜品 ID');
  if (!(await store.getDish(id))) return sendError(res, 404, '菜品不存在');
  const b = req.body || {};
  if (!Array.isArray(b.allergenIds)) return sendError(res, 400, 'allergenIds 必须是数组');
  const allergens = await store.setDishAllergens(id, b.allergenIds);
  res.json({ data: allergens });
}));

module.exports = router;
