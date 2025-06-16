import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";

class CreateUserController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { name, email, password } = request.body;
      
            const service = new CreateUserService();
            const user = await service.execute({ name, email, password });
      
            return response.status(201).json(user);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { CreateUserController }