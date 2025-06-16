import { Request, Response } from "express";
import { AuthUserService } from '../../services/user/AuthUserService';

class AuthUserController {

    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { email, password } = request.body;

            const authUserService = new AuthUserService();

            const session = await authUserService.execute({
                email,
                password
            });

            return response.json(session);
        } catch (err: any) {
            return response.status(400).json({ error: err.message });
        }
    }
}

export { AuthUserController };