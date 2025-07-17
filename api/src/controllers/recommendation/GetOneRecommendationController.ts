import { Request, Response } from "express";
import { GetOneRecommendationService } from "../../services/recommendation/GetOneRecommendationService";

class GetOneRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { id } = request.params;
            const user_id = request.user_id;

            if (!id) {
                return response.status(400).json({ error: "ID da recomendação é obrigatório." });
            }
      
            const getOneRecommendationService = new GetOneRecommendationService();
      
            const recommendation = await getOneRecommendationService.execute({
              user_id,
              id
            });
      
            return response.status(201).json(recommendation);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { GetOneRecommendationController }