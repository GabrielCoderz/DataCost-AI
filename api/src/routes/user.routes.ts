import { Router } from 'express';
import { GetAWSServicesController } from '../controllers/aws_services/GetAWSServicesController';
import { GetAWSPricingController } from '../controllers/aws_pricing/GetAWSPricingService';
// import { AuthUserController } from '../controllers/user/AuthUserController';

const userRoutes = Router();

userRoutes.post('/', new GetAWSServicesController().handle);
userRoutes.post('/pricing', new GetAWSPricingController().handle);
// userRoutes.post('/', new CreateUserController().handle);
// userRoutes.post('/session', new AuthUserController().handle);

export { userRoutes };