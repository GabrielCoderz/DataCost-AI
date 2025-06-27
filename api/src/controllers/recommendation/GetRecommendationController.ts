import { Request, Response } from "express";
import { GetRecommendationService } from "../../services/recommendation/GetRecommendationService";

class GetRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const user_id = request.user_id;
      
            const getRecommendationService = new GetRecommendationService();
      
            const recommendation = await getRecommendationService.execute({
              user_id,
            });
      
            return response.status(201).json(recommendation);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { GetRecommendationController }