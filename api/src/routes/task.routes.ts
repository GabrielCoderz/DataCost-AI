import { Router } from 'express';
// import { CreateTaskController } from '../controllers/task/CreateTaskController';
// import { ListTaskController } from '../controllers/task/ListTaskController';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { SaveRecommendationController } from '../controllers/recommendation/SaveRecommendationController';
import { GetRecommendationController } from '../controllers/recommendation/GetRecommendationController';
// import { UpdateTaskStatusController } from '../controllers/task/UpdateStatusTaskController';

const taskRoutes = Router();

taskRoutes.post('/', isAuthenticated, new SaveRecommendationController().handle);
taskRoutes.get('/', isAuthenticated, new GetRecommendationController().handle);
// taskRoutes.get('/', isAuthenticated, new ListTaskController().handle);
// taskRoutes.patch('/:id/completed', isAuthenticated, new UpdateTaskStatusController().handle);

export { taskRoutes };