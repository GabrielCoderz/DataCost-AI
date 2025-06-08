import { Router } from 'express';
// import { CreateTaskController } from '../controllers/task/CreateTaskController';
// import { ListTaskController } from '../controllers/task/ListTaskController';
// import { isAuthenticated } from '../middlewares/isAuthenticated';
// import { UpdateTaskStatusController } from '../controllers/task/UpdateStatusTaskController';

const taskRoutes = Router();

// taskRoutes.post('/', isAuthenticated, new CreateTaskController().handle);
// taskRoutes.get('/', isAuthenticated, new ListTaskController().handle);
// taskRoutes.patch('/:id/completed', isAuthenticated, new UpdateTaskStatusController().handle);

export { taskRoutes };