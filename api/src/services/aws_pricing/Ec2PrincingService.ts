import { PricingClient, GetProductsCommand } from "@aws-sdk/client-pricing";
import axios from 'axios'; // Importar axios para fazer requisições HTTP a APIs externas
import { Options } from "./GetAWSPricingService";

// Se você não tem axios instalado:
// npm install axios
// npm install --save-dev @types/axios

interface AwsProductPrice {
  product: {
    productFamily: string;
    attributes: {
      memory: string;
      vcpu: string;
      operatingSystem: string;
      regionCode: string;
      instanceType: string;
      location: string;
      marketoption: string;
      [key: string]: string;
    };
    sku: string;
  };
  serviceCode: string;
  terms: {
    OnDemand?: {
      [termKey: string]: {
        priceDimensions: {
          [priceDimensionKey: string]: {
            unit: string;
            description: string;
            pricePerUnit: { USD: string };
          };
        };
      };
    };
  };
  version: string;
  publicationDate: string;
}

interface PriceInfo {
  instanceType: string;
  vcpu: string;
  memory: string;
  operatingSystem: string;
  regionName: string;
  pricePerUnitUSD: number;
  unit: string;
}

export class Ec2PricingService {
  private awsPricingClient: PricingClient;
  // Sugestão de API de Câmbio: ExchangeRate-API
  // Você precisa de uma chave de API gratuita. Obtenha em https://www.exchangerate-api.com/
  private exchangeRateApiBaseUrl = 'https://open.er-api.com/v6/latest/USD';
  // ATENÇÃO: Substitua 'YOUR_API_KEY' pela sua chave real se usar outra API
  // private exchangeRateApiKey = 'YOUR_API_KEY'; 

  // Cache para a taxa de câmbio para evitar chamadas excessivas
  private cachedExchangeRate: { rate: number; timestamp: number } | null = null;
  private cacheDurationMs = 1 * 60 * 60 * 1000; // 1 hora de cache

  constructor(region: string = "us-east-1") {
    this.awsPricingClient = new PricingClient({ region: "us-east-1" });
  }

  /**
   * Obtém a taxa de câmbio de USD para BRL.
   * Usa cache para evitar chamadas repetitivas à API de câmbio.
   * @returns A taxa de câmbio USD para BRL.
   */
  private async getExchangeRate(): Promise<number> {
    const now = Date.now();
    if (this.cachedExchangeRate && (now - this.cachedExchangeRate.timestamp < this.cacheDurationMs)) {
      console.log("Usando taxa de câmbio do cache.");
      return this.cachedExchangeRate.rate;
    }

    try {
      // Exemplo usando ExchangeRate-API (sem chave se for gratuito/limite alto)
      // Se precisar de chave, adicione como parâmetro ou no cabeçalho:
      // const response = await axios.get(`${this.exchangeRateApiBaseUrl}?apikey=${this.exchangeRateApiKey}`);
      const response = await axios.get(this.exchangeRateApiBaseUrl);
      
      if (response.data && response.data.rates && response.data.rates.BRL) {
        const rate = response.data.rates.BRL;
        this.cachedExchangeRate = { rate: rate, timestamp: now };
        console.log(`Taxa de câmbio USD para BRL obtida: ${rate}`);
        return rate;
      } else {
        console.warn("API de câmbio não retornou a taxa BRL esperada. Usando taxa fixa.");
        return 5.0; // Taxa fixa de fallback
      }
    } catch (error) {
      console.error("Erro ao obter taxa de câmbio da API, usando taxa fixa:", error);
      return 5.0; // Taxa fixa de fallback em caso de erro
    }
  }

  /**
   * Mapeia os requisitos do usuário para um conjunto de filtros da API de precificação.
   */
  private buildFilters(
    vcpus: number,
    memoryGiB: number,
    operatingSystem: string,
    regionName: string,
    interruptionTolerance: 'yes' | 'no'
  ): any[] {
    const filters: any[] = [
      { Type: "TERM_MATCH", Field: "operatingSystem", Value: operatingSystem },
      { Type: "TERM_MATCH", Field: "location", Value: regionName },
      { Type: "TERM_MATCH", Field: "preInstalledSw", Value: "NA" },
      { Type: "TERM_MATCH", Field: "licenseModel", Value: "No License Required" },
      { Type: "TERM_MATCH", Field: "tenancy", Value: "Shared" },
      { Type: "TERM_MATCH", Field: "currentGeneration", Value: "Yes" },
      { Type: "TERM_MATCH", Field: "vcpu", Value: String(vcpus) },
      { Type: "TERM_MATCH", Field: "memory", Value: `${memoryGiB} GiB` }
    ];

    filters.push({ Type: "TERM_MATCH", Field: "capacitystatus", Value: "Used" });
    filters.push({ Type: "TERM_MATCH", Field: "marketoption", Value: "OnDemand" });

    return filters;
  }

  /**
   * Busca e retorna o menor preço On-Demand (diferente de zero) para uma EC2
   * que corresponda aos critérios, em BRL.
   *
   * @returns Objeto com o menor preço em BRL, moeda, unidade e detalhes da instância.
   */
  public async getLowestEc2OnDemandPriceInBRL(
    vcpus: number,
    memoryGiB: number,
    operatingSystem: string,
    regionName: string,
    hoursPerMonth: number,
    interruptionTolerance: 'yes' | 'no'
  ): Promise<{
    lowestPriceUSD: number; // Preço unitário em USD
    lowestPriceBRL: number; // Preço unitário em BRL
    currency: string;
    unit: string;
    instanceDetails: PriceInfo;
    monthlyCostUSD: number; // Custo mensal em USD
    monthlyCostBRL: number; // Custo mensal em BRL
  } | null> {
    const filters = this.buildFilters(vcpus, memoryGiB, operatingSystem, regionName, interruptionTolerance);

    try {
      const exchangeRateBRL = await this.getExchangeRate(); // OBTÉM A TAXA DE CÂMBIO

      const command = new GetProductsCommand({
        ServiceCode: "AmazonEC2",
        Filters: filters,
        MaxResults: 100
      });
      const data = await this.awsPricingClient.send(command);

      let lowestPriceFoundUSD: number = Infinity;
      let lowestPriceDetails: PriceInfo | null = null;
      let lowestPriceUnit: string = '';

      if (!data.PriceList || data.PriceList.length === 0) {
        console.warn("Nenhum produto EC2 encontrado com os filtros fornecidos.");
        return null;
      }

      data.PriceList.forEach((productJsonString: string) => {
        const product: AwsProductPrice = JSON.parse(productJsonString);
        const onDemandTerms = product.terms.OnDemand;

        if (onDemandTerms) {
          for (const termKey in onDemandTerms) {
            const term = onDemandTerms[termKey];
            const priceDimensions = term.priceDimensions;

            for (const priceDimensionKey in priceDimensions) {
              const priceInfo = priceDimensions[priceDimensionKey];

              const pricePerUnitStr = priceInfo.pricePerUnit.USD;
              const priceUSD = parseFloat(pricePerUnitStr);

              if (priceUSD > 0 && priceUSD < lowestPriceFoundUSD) {
                lowestPriceFoundUSD = priceUSD;
                lowestPriceUnit = priceInfo.unit;
                lowestPriceDetails = {
                  instanceType: product.product.attributes.instanceType,
                  vcpu: product.product.attributes.vcpu,
                  memory: product.product.attributes.memory,
                  operatingSystem: product.product.attributes.operatingSystem,
                  regionName: product.product.attributes.location,
                  pricePerUnitUSD: priceUSD,
                  unit: priceInfo.unit
                };
              }
            }
          }
        }
      });

      if (lowestPriceDetails && lowestPriceFoundUSD !== Infinity) {
        let effectiveHourlyPriceUSD = lowestPriceFoundUSD;
        if (lowestPriceUnit === "Sec") {
            effectiveHourlyPriceUSD = lowestPriceFoundUSD * 3600; 
        }
        const monthlyCostUSD = effectiveHourlyPriceUSD * hoursPerMonth;
        
        // CONVERSÃO PARA BRL
        const lowestPriceBRL = lowestPriceFoundUSD * exchangeRateBRL;
        const monthlyCostBRL = monthlyCostUSD * exchangeRateBRL;

        return {
          lowestPriceUSD: lowestPriceFoundUSD,
          lowestPriceBRL: lowestPriceBRL,
          currency: "BRL", // Moeda final
          unit: lowestPriceUnit,
          instanceDetails: lowestPriceDetails,
          monthlyCostUSD: monthlyCostUSD,
          monthlyCostBRL: monthlyCostBRL
        };
      } else {
        console.warn("Nenhum preço On-Demand válido (diferente de zero) encontrado com os filtros.");
        return null;
      }

    } catch (error) {
      console.error("Erro ao buscar o menor preço EC2 (BRL):", error);
      throw error;
    }
  }
}

// --- Exemplo de Uso no Backend (Node.js) ---
export async function runExample(options: Options) {
    // console.log('veio')
    // console.log(options)
  const { 
    os,
    memoryGiB,
    vcpus,
    region,
    hours
  } = options

  const ec2Service = new Ec2PricingService();

//   const vcpus = 1;
//   const memoryGiB = 1;
//   const os = 'Linux';
//   const region = "US East (N. Virginia)";
//   const hours = 730;
  const interruptionTolerance = 'no';

  try {
    console.log(`Buscando o menor preço para EC2 com ${vcpus} vCPUs, ${memoryGiB} GiB RAM, OS ${os} na região ${region} e convertendo para BRL...`);
    const result = await ec2Service.getLowestEc2OnDemandPriceInBRL(
      vcpus, memoryGiB, os, region, hours, interruptionTolerance
    );

    if (result) {
      console.log("\n--- Menor Preço Encontrado (BRL) ---");
      console.log(`Tipo de Instância: ${result.instanceDetails.instanceType}`);
      console.log(`vCPUs: ${result.instanceDetails.vcpu}`);
      console.log(`Memória: ${result.instanceDetails.memory}`);
      console.log(`Preço por ${result.unit} (USD): ${result.currency} ${result.lowestPriceUSD.toFixed(8)}`);
      console.log(`Preço por ${result.unit} (BRL): BRL ${result.lowestPriceBRL.toFixed(8)}`);
      console.log(`Custo Mensal Estimado (USD): USD ${result.monthlyCostUSD.toFixed(2)}`);
      console.log(`Custo Mensal Estimado (BRL): BRL ${result.monthlyCostBRL.toFixed(2)}`);

      return result
    } else {
      // console.log("Não foi possível encontrar um preço válido para a configuração especificada.");
    }
  } catch (error) {
    console.error("Erro na execução do exemplo:", error);
  }
}

// Descomente a linha abaixo para executar o exemplo diretamente:
// runExample();