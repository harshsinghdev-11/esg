import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentsRoutes from './modules/departments/departments.routes.js';
import employeesRoutes from './modules/employees/employees.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import policiesRoutes from './modules/policies/policies.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: false,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentsRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/policies', policiesRoutes);
app.use('/api/v1/settings', settingsRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
