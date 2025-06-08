import path from "path"
import fs from 'fs/promises';

interface Extract {
    origin: string;
    frequency: string;
    size: string;
}

interface Transform {
    complexity: string;
    frequency: string;
    duration: string;
}

interface Load {
    storeLocation: string;
    needSQL: string;
    needVisualization: string;
}

interface AWSRecommendation {
    extract: Extract;
    transform: Transform;
    load: Load;
}

class GetAWSServicesService {

    async execute({ extract, transform, load }: AWSRecommendation) {
        const { origin, frequency: extract_frequency, size } = extract
        const { complexity, frequency: transform_frequency, duration } = transform
        const { storeLocation, needSQL, needVisualization } = load

        // const dataPath = path.join(__dirname, './aws_services.json');
        const dataExtractPath = path.join(__dirname, './combinations_recommendations/extract_combinations.json');
        const dataTransformPath = path.join(__dirname, './combinations_recommendations/transform_combinations.json');
        const dataLoadPath = path.join(__dirname, './combinations_recommendations/load_combinations.json');
        
        try {
            const [extractContent, transformContent, loadContent] = await Promise.all([
                fs.readFile(dataExtractPath, 'utf8'),
                fs.readFile(dataTransformPath, 'utf8'),
                fs.readFile(dataLoadPath, 'utf8')
            ]);

            const parsedExtractData = JSON.parse(extractContent);
            const parsedTransformData = JSON.parse(transformContent);
            const parsedLoadData = JSON.parse(loadContent);

            const dataExtract = parsedExtractData.filter((item: any) => 
                item.origin === origin && 
                item.frequency === extract_frequency && 
                item.size === size
            )

            const dataTransform = parsedTransformData.filter((item: any) => 
                item.complexity === complexity && 
                item.frequency === transform_frequency && 
                item.duration === duration
            )

            console.log(parsedTransformData)

            const dataLoad = parsedLoadData.filter((item: any) => 
                item.storeLocation === storeLocation && 
                item.needSQL === needSQL && 
                item.needVisualization === needVisualization
            )

            return {
                extract: dataExtract,
                transform: dataTransform,
                load: dataLoad
            };
        } catch (error) {
            throw new Error("Erro ao carregar o arquivo");
        }
    }

}

export { GetAWSServicesService }