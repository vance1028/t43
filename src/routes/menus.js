'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, isValidDate } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_MEAL = ['BREAKFAST', 'LUNCH', 'DINNER'];

router.get('/', wrap(async (req, res) => {
  const filters = {};
  if (req.query.date !== undefined) {
    if (!isValidDate(req.query.date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
    filters.date = req.query.date;
  }
  const list = await store.listMenus(filters);
  const enriched = [];
  for (const m of list) {
    const dishes = await store.listMenuDishes(m.id);
    enriched.push({ ...m, dishDetails: dishes });
  }
  res.json({ data: enriched, total: enriched.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = req.params.id;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return sendError(res, 400, '无效的菜单 ID');
  const m = await store.getMenuById(n);
  if (!m) return sendError(res, 404, '菜单不存在');
  const dishes = await store.listMenuDishes(m.id);
  res.json({ data: { ...m, dishDetails: dishes } });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isValidDate(b.menuDate)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
  if (!VALID_MEAL.includes(b.meal)) return sendError(res, 400, `餐次只能是 ${VALID_MEAL.join(' / ')}`);

  const existed = await store.findMenu(b.menuDate, b.meal);
  const m = await store.upsertMenu({ menuDate: b.menuDate, meal: b.meal, dishes: b.dishes || '' });

  if (Array.isArray(b.dishIds)) {
    await store.setMenuDishes(m.id, b.dishIds);
  }

  const result = await store.getMenuById(m.id);
  const dishes = await store.listMenuDishes(m.id);

  let conflictWarning = null;
  try {
    const conflicts = await store.checkMenuConflicts(b.menuDate, b.meal);
    if (conflicts.conflictCount > 0) {
      conflictWarning = {
        hasConflicts: true,
        fatalCount: conflicts.fatalCount,
        severeCount: conflicts.severeCount,
        mildCount: conflicts.mildCount,
        affectedStudentCount: conflicts.affectedStudentCount,
        warnings: conflicts.warnings,
      };
    }
  } catch (_) {}

  res.status(existed ? 200 : 201).json({
    data: { ...result, dishDetails: dishes },
    ...(conflictWarning ? { allergenWarning: conflictWarning } : {}),
  });
}));

module.exports = router;
