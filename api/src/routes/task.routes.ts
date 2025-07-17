import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { SaveRecommendationController } from '../controllers/recommendation/SaveRecommendationController';
import { GetRecommendationController } from '../controllers/recommendation/GetRecommendationController';
import { GetOneRecommendationController } from '../controllers/recommendation/GetOneRecommendationController';
import { DeleteRecommendationController } from '../controllers/recommendation/DeleteRecommendationController';

const taskRoutes = Router();

taskRoutes.post('/', isAuthenticated, new SaveRecommendationController().handle);
taskRoutes.get('/', isAuthenticated, new GetRecommendationController().handle);
taskRoutes.get('/:id', isAuthenticated, new GetOneRecommendationController().handle);
taskRoutes.delete('/:id', isAuthenticated, new DeleteRecommendationController().handle);
// taskRoutes.get('/', isAuthenticated, new ListTaskController().handle);
// taskRoutes.patch('/:id/completed', isAuthenticated, new UpdateTaskStatusController().handle);

export { taskRoutes };