import prisma from '../../prisma';

interface RecommendationRequest {
    user_id: string;
    id: string;
}

class DeleteRecommendationService {

    async execute({ user_id, id }: RecommendationRequest) {

        const recommendationExists = await prisma.recommendation.findFirst({
            where: {
                userId: user_id,
                id
            },
        })

        if(!recommendationExists) {
            throw new Error("Não existe essa arquitetura.");
        }

        const recommendation = await prisma.recommendation.delete({
            where: {
                userId: user_id,
                id
            },
        })
        
        return recommendation;
    }

}

export { DeleteRecommendationService }