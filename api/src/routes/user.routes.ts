import { Router } from 'express';
import { GetAWSServicesController } from '../controllers/aws_services/GetAWSServicesController';
import { GetAWSPricingController } from '../controllers/aws_pricing/GetAWSPricingService';
import { OpenAIRecommendationController } from '../controllers/openai/OpenAIRecommendationController';
import { CreateUserController } from '../controllers/user/CreateUserController';
import { AuthUserController } from '../controllers/user/AuthUserController';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const userRoutes = Router();

userRoutes.post('/', new GetAWSServicesController().handle);
userRoutes.post('/pricing', new GetAWSPricingController().handle);
userRoutes.post('/recommendation/ai', new OpenAIRecommendationController().handle);

userRoutes.post('/create', new CreateUserController().handle);
userRoutes.post('/auth', new AuthUserController().handle);

export { userRoutes };