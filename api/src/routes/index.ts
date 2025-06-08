import { Router } from 'express';
import { userRoutes } from './user.routes';
import { taskRoutes } from './task.routes';

const router = Router();

router.use('/api/v1/users', userRoutes);
router.use('/api/v1/tasks', taskRoutes);

export { router };