const { PricingClient, GetProductsCommand } = require("@aws-sdk/client-pricing"); 

const client = new PricingClient({ region: "us-east-1" });

const command = new GetProductsCommand({
    ServiceCode: "AmazonAthena",
    Filters: [
        {
            Type: "TERM_MATCH",
            Field: "location",
            Value: "US East (N. Virginia)"
        }
    ]
});

const command2 = new GetProductsCommand({
    ServiceCode: "AmazonEC2",
    Filters: [
        { Field: "instanceType", Type: "TERM_MATCH", Value: "t3.micro" },
        { Field: "location", Type: "TERM_MATCH", Value: "US East (N. Virginia)" },
        { Field: "operatingSystem", Type: "TERM_MATCH", Value: "Linux" },
        { Field: "tenancy", Type: "TERM_MATCH", Value: "Shared" },
        { Field: "preInstalledSw", Type: "TERM_MATCH", Value: "NA" },
        { Field: "capacitystatus", Type: "TERM_MATCH", Value: "Used" }
    ]
});


async function run(){
    try {
        const response = await client.send(command)

        const product = JSON.parse(response.PriceList[0]);

        const terms = product.terms.OnDemand;
        const termKey = Object.keys(terms)[0];
        const priceDimensions = terms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        const pricePerGB = priceDimensions[dimensionKey].pricePerUnit.USD;

        console.log(priceDimensions)

        console.log(`💰 Preço por GB no EC2: US$ ${pricePerGB}`);
    } catch (error) {
        console.log(error)
    }
}

run()