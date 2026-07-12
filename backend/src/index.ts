import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentsRoutes from './modules/departments/departments.routes.js';
import employeesRoutes from './modules/employees/employees.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import emissionFactorsRoutes from './modules/emission-factors/emission-factors.routes.js';
import badgesRoutes from './modules/badges/badges.routes.js';
import rewardsRoutes from './modules/rewards/rewards.routes.js';
import policiesRoutes from './modules/policies/policies.routes.js';
import environmentalGoalsRoutes from './modules/environmental-goals/environmental-goals.routes.js';
import { operationalRecordsRouter } from './modules/operational-records/operational-records.routes.js';
import { carbonTransactionsRouter } from './modules/carbon-transactions/carbon-transactions.routes.js';
import { csrActivitiesRouter } from './modules/csr-activities/csr-activities.routes.js';
import { participationsRouter } from './modules/participations/participations.routes.js';
import { challengesRouter } from './modules/challenges/challenges.routes.js';
import { challengeParticipationsRouter } from './modules/challenge-participations/challenge-participations.routes.js';
import { leaderboardRouter } from './modules/leaderboard/leaderboard.routes.js';
import { auditsRouter } from './modules/audits/audits.routes.js';
import { complianceIssuesRouter } from './modules/compliance-issues/compliance-issues.routes.js';
import { scoresRouter } from './modules/scores/scores.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';

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
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/emission-factors', emissionFactorsRoutes);
app.use('/api/v1/badges', badgesRoutes);
app.use('/api/v1', rewardsRoutes);
app.use('/api/v1/policies', policiesRoutes);
app.use('/api/v1/environmental-goals', environmentalGoalsRoutes);

app.use('/api/v1/operational-records', operationalRecordsRouter);
app.use('/api/v1/carbon-transactions', carbonTransactionsRouter);
app.use('/api/v1/csr-activities', csrActivitiesRouter);
app.use('/api/v1/participations', participationsRouter);
app.use('/api/v1/challenges', challengesRouter);
app.use('/api/v1/challenge-participations', challengeParticipationsRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/audits', auditsRouter);
app.use('/api/v1/compliance-issues', complianceIssuesRouter);
app.use('/api/v1/scores', scoresRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/notifications', notificationsRouter);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
