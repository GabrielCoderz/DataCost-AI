import { Request, Response } from "express";
import { SaveRecommendationService } from "../../services/recommendation/SaveRecommendationService";

class SaveRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { extractData, transformData, loadData, responseAI } = request.body;
            const user_id = request.user_id;
      
            const saveRecommendationService = new SaveRecommendationService();
      
            const recommendation = await saveRecommendationService.execute({
              user_id,
              extractData,
              transformData,
              loadData,
              response: responseAI
            });
      
            return response.status(201).json(recommendation);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { SaveRecommendationController }