const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middlewares/auth');

const teacherRoutes = require('./modules/teachers/routes');
const scheduleRoutes = require('./modules/schedules/routes');
const courseRoutes = require('./modules/courses/routes');
const departmentRoutes = require('./modules/departments/routes');
const studentRoutes = require('./modules/students/routes');
const subjectRoutes = require('./modules/subjects/routes');
const periodRoutes = require('./modules/periods/routes');
const enrollmentRoutes = require('./modules/enrollments/routes');
const academicProgramRoutes = require('./modules/academicPrograms/routes');
const availabilityRoutes = require('./modules/availability/routes');
const conflictRoutes = require('./modules/conflicts/routes');
const authRoutes = require('./modules/auth/routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));


app.use('/api/auth', authRoutes);


app.use('/api/teachers', authMiddleware, teacherRoutes);
app.use('/api/schedules', authMiddleware, scheduleRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/departments', authMiddleware, departmentRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/subjects', authMiddleware, subjectRoutes);
app.use('/api/periods', authMiddleware, periodRoutes);
app.use('/api/enrollments', authMiddleware, enrollmentRoutes);
app.use('/api/academic-programs', authMiddleware, academicProgramRoutes);
app.use('/api/availability', authMiddleware, availabilityRoutes);
app.use('/api/conflicts', authMiddleware, conflictRoutes);


app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

module.exports = app;