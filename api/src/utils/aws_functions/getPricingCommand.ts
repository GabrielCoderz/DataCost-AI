import {
  GetProductsCommand,
  GetProductsCommandInput
} from '@aws-sdk/client-pricing';

export function getAwsPricingCommand(serviceName: string, options: any = {}): GetProductsCommand {
  const commonRegion = 'US East (N. Virginia)';
  let input: GetProductsCommandInput;

  console.log(serviceName)

  switch (serviceName.toLowerCase()) {
    case 'ec2':
      input = {
        ServiceCode: 'AmazonEC2',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: commonRegion },
          // { Type: 'TERM_MATCH', Field: 'instanceType', Value: options.instanceType || 't3.micro' },
          // { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: options.operatingSystem || 'Linux' },
          // { Type: 'TERM_MATCH', Field: 'tenancy', Value: options.tenancy || 'Shared' },
          // { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
          // { Type: 'TERM_MATCH', Field: 'capacitystatus', Value: 'Used' },
          { Type: "TERM_MATCH", Field: "vcpu", Value: options.vcpus }, // vCPU é um número, mas o Value deve ser string
          { Type: "TERM_MATCH", Field: "memory", Value: `${options.memoryGiB} GiB` } // Memória como string com " GiB"
        ],
        MaxResults: 10
      };
      break;

    case 'lambda':
      input = {
        ServiceCode: 'AWSLambda',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          }
        ]
      };
      break;

    case 's3':
      input = {
        ServiceCode: 'AmazonS3',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'storageClass',
            Value: 'Non-Critical Data'
          },
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          }
        ]
      };
      break;

    case 'glue':
      input = {
        ServiceCode: 'AWSGlue',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'operation',
            Value: 'OptimizationJobRun'
          },
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          }
        ]
      };
      break;

    case 'rds':
      input = {
        ServiceCode: 'AmazonRDS',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          },
          {
            Type: 'TERM_MATCH',
            Field: 'databaseEngine',
            Value: options.databaseName
          },
          {
            Type: 'TERM_MATCH',
            Field: 'instanceType',
            Value: options.instanceType
          },
          {
            Type: 'TERM_MATCH',
            Field: 'deploymentOption',
            Value: 'Single-AZ'
          }
        ]
      };
      break;

    case 'athena':
      input = {
        ServiceCode: 'AmazonAthena',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          }
        ]
      };
      break;

    case 'quicksight':
      input = {
        ServiceCode: 'AmazonQuickSight',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'location',
            Value: commonRegion
          }
        ]
      };
      break;

    default:
      throw new Error(`Serviço não suportado: ${serviceName}`);
  }

  return new GetProductsCommand(input);
}