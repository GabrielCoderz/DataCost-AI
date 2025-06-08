import { Request, Response } from "express";
import { GetAWSPricingService } from "../../services/aws_pricing/GetAWSPricingService";

class GetAWSPricingController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { serviceName, options } = request.body;

            const service = new GetAWSPricingService();
            const aws_pricing = await service.execute({ serviceName, options });

            if(!aws_pricing) {
              return response.status(400).json({ error: 'Quantidade de vCPUs/Memória RAM inválida' });
            }
      
            return response.status(201).json(aws_pricing);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { GetAWSPricingController }