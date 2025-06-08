import { Request, Response } from "express";
import { GetAWSPricingService } from "../../services/aws_pricing/GetAWSPricingService";
import { OpenAIRecommendationService } from "../../services/openai/OpenAIRecommendationService";

class OpenAIRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { prompt } = request.body;

            const service = new OpenAIRecommendationService();
            const recommendation = await service.execute(prompt);

            if(!recommendation) {
              return response.status(400).json({ error: 'Quantidade de vCPUs/Memória RAM inválida' });
            }
      
            return response.status(201).json(recommendation);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { OpenAIRecommendationController }