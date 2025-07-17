import prisma from '../../prisma';

interface RecommendationRequest {
    user_id: string;
    id: string;
}

class GetOneRecommendationService {

    async execute({ id, user_id }: RecommendationRequest) {

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                userId: user_id,
                id,
            }
        })
        
        return recommendation;
    }

}

export { GetOneRecommendationService }