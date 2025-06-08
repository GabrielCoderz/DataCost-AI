// import prisma from '../../prisma';
import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing'
import { getAwsPricingCommand } from '../../utils/aws_functions/getPricingCommand';
import { runExample } from './Ec2PrincingService';

export interface Options {
    instanceType?: string;
    databaseName?: string;
    tenancy?: string
    vcpus: number;
    memoryGiB: number;
    os: string;
    region: string;
    hours: number;
}

interface AWSRequest {
    serviceName: string;
    options?: Options
}

class GetAWSPricingService {

    private client: PricingClient;

    constructor() {
        this.client = new PricingClient({ region: "us-east-1" });
    }

    async execute({ serviceName, options }: AWSRequest) {
        if(!options) throw new Error('Necessita dos atributos da máquina')
        return await this.run(options);
    }

    async run(options: Options){
        try {
            const data = await runExample(options)

            // const command = getAwsPricingCommand(serviceName, options)

            // const response: any = await this.client.send(command)

            // const product = JSON.parse(response.PriceList[0]);

            // let test = response.PriceList.find((i: any) => i?.product?.attributes?.usageGroup === 'Paid')

            // console.log(JSON.parse(response.PriceList[0]))

            // response.PriceList.map((item: any) => {
            //     // console.log(JSON.parse(item))
            //     const test = JSON.parse(item)

            //     const produtos: any = Object.values(test);

            //     let term = produtos[2].OnDemand
            //     let ok = Object.keys(term)[0]
            //     let testt = term[ok].priceDimensions
            //     // console.log(produtos)


            //     const produtosPagos = produtos.filter((p: any) => 
            //         p?.attributes?.usageGroup === 'Paid'
            //     );

            //     produtos.map((p: any) => {
            //         // if(p?.attributes?.storageClass !== undefined) {
            //         //     console.log(p?.attributes?.storageClass)
            //         // }

            //         // if(p?.OnDemand !== undefined) {
            //         //     console.log(p?.OnDemand['4N6K3A6GUPP28B3P.JRTCKXETXF'])
            //         // }
            //     })

            //     // console.log(produtosPagos)

            //     // const ok = test.filter((e: any) => e.product.attributes.usageGroup === 'Paid')

            //     // console.log(ok)
            // })

            // console.log(response.PriceList[0])
          

            // const terms = product.terms.OnDemand;
            // const termKey = Object.keys(terms)[0];
            // const priceDimensions = terms[termKey].priceDimensions;
            // const dimensionKey = Object.keys(priceDimensions)[0];
            // const pricePerGB = priceDimensions[dimensionKey].pricePerUnit.USD;

            // console.log(priceDimensions)
            // console.log(product.product.terms)

            // console.log(`💰 Preço por GB no EC2: US$ ${pricePerGB}`);

            return data
        } catch (error) {
            console.log(error)
        }
}

}

export { GetAWSPricingService }