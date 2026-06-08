'use strict';

const express = require('express');
const cors = require('cors');

const studentsRouter = require('./routes/students');
const plansRouter = require('./routes/plans');
const enrollmentsRouter = require('./routes/enrollments');
const menusRouter = require('./routes/menus');
const attendancesRouter = require('./routes/attendances');
const allergensRouter = require('./routes/allergens');
const dishesRouter = require('./routes/dishes');
const allergenCheckRouter = require('./routes/allergen-check');
const { sendError } = require('./utils/http');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: '学生小饭桌管理平台',
      time: new Date().toISOString(),
    });
  });

  app.use('/api/students', studentsRouter);
  app.use('/api/plans', plansRouter);
  app.use('/api/enrollments', enrollmentsRouter);
  app.use('/api/menus', menusRouter);
  app.use('/api/attendances', attendancesRouter);
  app.use('/api/allergens', allergensRouter);
  app.use('/api/dishes', dishesRouter);
  app.use('/api/allergen-check', allergenCheckRouter);

  app.use((req, res) => sendError(res, 404, '接口不存在'));

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return sendError(res, 400, '请求体不是合法的 JSON');
    }
    console.error(err);
    return sendError(res, 500, '服务器内部错误');
  });

  return app;
}

module.exports = { createApp };
