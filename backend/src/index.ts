import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentsRoutes from './modules/departments/departments.routes.js';
import employeesRoutes from './modules/employees/employees.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentsRoutes);
app.use('/api/v1/employees', employeesRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});