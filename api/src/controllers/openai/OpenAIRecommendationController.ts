import { Request, Response } from "express";
import { GetAWSPricingService } from "../../services/aws_pricing/GetAWSPricingService";
import { OpenAIRecommendationService } from "../../services/openai/OpenAIRecommendationService";

class OpenAIRecommendationController {
    
    async handle(request: Request, response: Response): Promise<any> {
        try {
            const { prompt } = request.body;

            const messages = `
            Você é um arquiteto de soluções em nuvem da AWS.

            Com base nesse cenário descrito pelo usuário:

            Qual é a origem dos dados?
            API Externa

            Com que frequência os dados chegam?
            Uma única vez

            Qual o tamanho médio dos dados?
            Menor de 100 mb

            Qual é o nível de complexidade das transformações nos dados?
            Simples

            Com que frequência os dados precisam ser transformados?
            Agendado.

            Para onde você quer enviar os dados após o processamento?
            Um banco de dados para consultas

            Você precisa consultar os dados com SQL?
            Sim

            O processamento será em batch.

            Recomende uma arquitetura de serviços AWS para cada etapa (EXTRACT, TRANSFORM e LOAD) e seja MUITO breve na justificativa de cada serviço.
            Seja coerente com a resposta do serviço recomendado.
            Recomende os serviços corretos para cada etapa.
            Por exemplo, não recomende um serviço de armazenamento no EXTRACT. Se precisar recomendar, utilize dois serviços para isso, por exemplo, um lambda para extrair e o s3 para armazenar os dados brutos, aí tudo bem.

            Quando for colocar o titulo EXTRACT, deixe o título assim **EXTRACT**.
            Quando for colocar o titulo TRANSFORM, deixe apenas o título **TRANSFORM**.
            Quando for colocar o titulo LOAD, deixe apenas o título **LOAD**.
            Quando for colocar o nome do serviço deixe -Serviço: <nome do serviço> 
            Quando for colocar a justificativa coloque -Justificativa <justificativa do serviço>

            Ao final de tudo coloque uma estimativa de custo real e correto da aws OBRIGATORIAMENTE. Coloque os custos na moeda real brasileiro (R$)

            Coloque o Custo Geral somado de todos os serviços recomendados:

            -Custo total <custo total>
            `

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