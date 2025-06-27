import prisma from '../../prisma';

interface RecommendationRequest {
    user_id: string;
}

class GetRecommendationService {

    async execute({ user_id }: RecommendationRequest) {

        const recommendation = await prisma.recommendation.findMany({
            where: {
                userId: user_id
            }
        })
        
        return recommendation;
    }

}

export { GetRecommendationService }