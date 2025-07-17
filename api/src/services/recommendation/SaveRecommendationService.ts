import prisma from '../../prisma';

interface RecommendationRequest {
    user_id: string;
    architectureName: string;
    extractData: string;
    transformData: string;
    loadData: string;
    response: string;
}

class SaveRecommendationService {

    async execute({ user_id, architectureName, extractData, transformData, loadData, response }: RecommendationRequest) {

        if(!extractData || !transformData || !loadData || !response) {
            throw new Error("Verifique se existe dados faltantes.");
        }

        const user = await prisma.recommendation.create({
            data: {
                architectureName,
                extractData,
                transformData,
                loadData,
                response,
                userId: user_id,
            },
        })
        
        return user;
    }

}

export { SaveRecommendationService }