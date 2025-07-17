import { Request, Response } from "express";
import { DeleteRecommendationService } from "../../services/recommendation/DeleteRecommendationService";

class DeleteRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { id } = request.params;
            const user_id = request.user_id;

            if (!id) {
                return response.status(400).json({ error: "ID da recomendação é obrigatório." });
            }
      
            const deleteRecommendationService = new DeleteRecommendationService();
      
            const recommendation = await deleteRecommendationService.execute({
              user_id,
              id,
            });
      
            return response.status(200).json({ message: "Recomendação excluída com sucesso.", recommendation });
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { DeleteRecommendationController }