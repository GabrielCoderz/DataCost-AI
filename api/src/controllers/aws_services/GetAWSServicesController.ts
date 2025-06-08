import { Request, Response } from "express";
import { GetAWSServicesService } from "../../services/aws_services/GetAWSServicesService";

class GetAWSServicesController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { extract, transform, load } = request.body;

            const service = new GetAWSServicesService();
            const aws_services = await service.execute({ extract, transform, load });
      
            return response.status(201).json(aws_services);
          } catch (err: any) {
            return response.status(400).json({ error: err.message });
          }
    } 

}

export { GetAWSServicesController }