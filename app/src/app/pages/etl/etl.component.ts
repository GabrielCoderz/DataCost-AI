import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { EtlService } from './etl.service';

interface ServiceItem {
  service: string;
  description: string;
}

interface Etapa {
  servico: string;
  justificativa: string;
}

interface CustoDetalhado {
  servico: string;
  descricao: string;
}

interface ArquiteturaComCusto {
  extract: Etapa[];
  transform: Etapa[];
  load: Etapa[];
  custoEstimado: {
    detalhado: CustoDetalhado[];
    total: string;
    observacao: string;
  };
}

interface ArquiteturaSeparada {
  extract: ServiceItem[];
  transform: ServiceItem[];
  load: ServiceItem[];
  visualization: ServiceItem[];
}

@Component({
  selector: 'app-etl',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    NgFor
  ],
  templateUrl: './etl.component.html',
  styleUrl: './etl.component.scss'
})
export class EtlComponent {
  etlForm: FormGroup;
  isLinear = false;
  results: any;

  arquitetura = {
    extract: '',
    transform: '',
    load: ''
  };

  selectedExtract = []
  selectedTransform = []
  selectedLoad = []

  extractServices = ['AWS Lambda', 'Amazon Kinesis', 'AWS DMS', 'Glue Crawler', 'EC2'];
  transformServices = ['AWS Glue', 'AWS Lambda', 'EMR', 'EC2', 'Redshift Spectrum'];
  loadServices = ['Amazon S3', 'Amazon RDS', 'Amazon Redshift', 'DynamoDB', 'EBS'];

  isLoading: boolean = false

  constructor(private fb: FormBuilder, private etlService: EtlService) {
    this.etlForm = this.fb.group({
      extract: this.fb.group({
        origin: ['', Validators.required],
        frequency: ['', Validators.required],
        size: ['', Validators.required],
        services: this.fb.array(this.extractServices.map(() => this.fb.control(false)))
      }),
      transform: this.fb.group({
        complexity: ['', Validators.required],
        frequency: ['', Validators.required],
        duration: ['', Validators.required],
        services: this.fb.array(this.transformServices.map(() => this.fb.control(false)))
      }),
      load: this.fb.group({
        storeLocation: ['', Validators.required],
        needSQL: ['', Validators.required],
        needVisualization: ['', Validators.required],
        services: this.fb.array(this.loadServices.map(() => this.fb.control(false)))
      })
    });
  }

  get extractServicesArray() {
    return this.etlForm.get('extract.services') as FormArray;
  }

  get transformServicesArray() {
    return this.etlForm.get('transform.services') as FormArray;
  }

  get loadServicesArray() {
    return this.etlForm.get('load.services') as FormArray;
  }

  getSelectedExtractServices(): string[] {
    const selectedBooleans = this.etlForm.get('extract.services')?.value as boolean[];
    return this.extractServices.filter((_, index) => selectedBooleans[index]);
  }

  getSelectedTransformServices(): string[] {
    const selectedBooleans = this.etlForm.get('transform.services')?.value as boolean[];
    return this.transformServices.filter((_, index) => selectedBooleans[index]);
  }

  getSelectedLoadServices(): string[] {
    const selectedBooleans = this.etlForm.get('load.services')?.value as boolean[];
    return this.loadServices.filter((_, index) => selectedBooleans[index]);
  }

  onSubmit() {
    console.log(this.etlForm.value);
    this.isLoading = true
    // this.etlService.getRecommendations(this.etlForm.value).subscribe({
    //   next: (result: any) => {
    //     this.results = result;
    //     console.log('Recomendações:', this.results);
    //   },
    //   error: (err: any) => {
    //     console.error('Erro ao buscar recomendações:', err);
    //   }
    // });

    this.extractServices = this.getSelectedExtractServices()
    this.transformServices = this.getSelectedTransformServices()
    this.loadServices = this.getSelectedLoadServices()

    console.log(this.extractServices.join(','))

    // console.log(this.etlForm.value.extract.origin)

    const msg = `
            Você é um arquiteto de soluções em nuvem da AWS.

            Com base nesse cenário descrito pelo usuário:

            **Extract**

            1.1) Qual é a origem dos dados?
            ${this.etlForm.value.extract.origin}.

            1.2) Com que frequência os dados chegam?
            ${this.etlForm.value.extract.frequecy}.

            1.3) Qual o tamanho médio dos dados?
            ${this.etlForm.value.extract.size}.

            1.4) Deseja sugerir serviços específicos? (Aceita apenas se for factível, caso não escolha os serviços que o usuário colocou, faça OBRIGATORIAMENTE a justificativa do por que não foi escolhido)
            ${this.extractServices.join(',')}.

            **Transform**

            2.1) Qual é o nível de complexidade das transformações nos dados?
            ${this.etlForm.value.transform.complexity}.

            2.2) Com que frequência os dados precisam ser transformados?
            ${this.etlForm.value.transform.frequency}.

            2.3) Quais serviços você considera para transformação?
            ${this.transformServices.join(',')}.

            **Load**

            3.1) Para onde você quer enviar os dados após o processamento?
            ${this.etlForm.value.load.storeLocation}.

            3.2) Você precisa consultar os dados com SQL?
            ${this.etlForm.value.load.storeLocation}.

            3.3) Quais serviços você deseja usar para armazenamento?
            ${this.loadServices.join(',')}.


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

            Explique corretamente a base de calculo de cada serviço recomendado.

            Coloque o Custo Geral somado de todos os serviços recomendados:

            -Custo total <custo total>

            ----------------

            Segue um exemplo de estrutura a ser seguido para TODAS AS OCASIÕES:

            **EXTRACT**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            COLOQUE ABAIXO OS SERVIÇOS QUE VOCÊ RECUSOU DO USUÁRIO NA PERGUNTA 1.4 (Considere todo o cenário para tirar a conclusão CORRETA E COERENTE):
            -ServiçosRecusado: <nome dos serviços recusados>
            -Justificativa: <justificativa dos serviços recusados>

            etc... se houver mais

            **TRANSFORM**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            COLOQUE ABAIXO OS SERVIÇOS QUE VOCÊ RECUSOU DO USUÁRIO NA PERGUNTA 2.3 (Considere todo o cenário para tirar a conclusão CORRETA E COERENTE):
            -ServiçosRecusado: <nome dos serviços recusados>
            -Justificativa: <justificativa dos serviços recusados>

            etc... se houver mais

            **LOAD**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            COLOQUE ABAIXO OS SERVIÇOS QUE VOCÊ RECUSOU DO USUÁRIO NA PERGUNTA 3.3 (Considere todo o cenário para tirar a conclusão CORRETA E COERENTE):
            -ServiçosRecusado: <nome dos serviços recusados>
            -Justificativa: <justificativa dos serviços recusados>

            etc... se houver mais

            **Estimativa de Custo**

            1. **<nome do serviço>**: <explicação detalhada da base de calculo>

            etc... se houver mais

            -Custo total: R$ <custo total na moeda brasileira>

            Esses custos são estimativas e podem variar com base no uso real e nas taxas de câmbio. É importante monitorar o uso e ajustar a arquitetura conforme necessário para otimizar os custos.
      `

    this.etlService.getRecommendationsAI({
      prompt: msg
    }).subscribe({
      next: (result: string) => {
        // this.results = result;
        console.log('Recomendações:', result);
        this.results = this.formatarRespostaGPTComCusto(result);

        console.log(this.results)

        console.log(this.formatarRespostaGPTComCusto(this.results))

        this.isLoading = false

        // console.log(this.arquitetura)
      },
      error: (err: any) => {
        console.error('Erro ao buscar recomendações:', err);
      }
    });
  }

  // public parseArquiteturaDetalhada(iaText: string): ArquiteturaSeparada {
  //   const clean = iaText.replace(/\\n/g, '\n');

  //   const extractMatch = clean.match(/\*\*EXTRACT:\*\*\n([\s\S]*?)(?=\n\*\*|$)/);
  //   const transformMatch = clean.match(/\*\*TRANSFORM:\*\*\n([\s\S]*?)(?=\n\*\*|$)/);
  //   const loadMatch = clean.match(/\*\*LOAD:\*\*\n([\s\S]*?)(?=\n\*\*|$)/);

  //   const extract = extractMatch ? this.parseServices(extractMatch[1]) : [];
  //   const transform = transformMatch ? this.parseServices(transformMatch[1]) : [];
  //   const load = loadMatch ? this.parseServices(loadMatch[1]) : [];

  //   // Extra visualização: procura por "QuickSight" no bloco de LOAD
  //   const visItems = load.filter(item =>
  //     item.service.toLowerCase().includes('quicksight')
  //   );
  //   const loadFiltered = load.filter(item =>
  //     !item.service.toLowerCase().includes('quicksight')
  //   );

  //   return {
  //     extract,
  //     transform,
  //     load: loadFiltered,
  //     visualization: visItems
  //   };
  // }

  // public parseServices(sectionText: string): ServiceItem[] {
  //   const lines = sectionText
  //     .split('\n')
  //     .map(line => line.trim())
  //     .filter(line => line.startsWith('- **'));

  //   const services: ServiceItem[] = [];

  //   for (const line of lines) {
  //     const match = line.match(/- \*\*(.+?)\*\*:?\s*(.+)/);
  //     if (match) {
  //       services.push({
  //         service: match[1],
  //         description: match[2]
  //       });
  //     }
  //   }

  //   return services;
  // }

  // public formatResponseGPT(resposta: string) {
  //   const resultado = {
  //     extract: [] as { servico: string; justificativa: string }[],
  //     transform: [] as { servico: string; justificativa: string }[],
  //     load: [] as { servico: string; justificativa: string }[],
  //   };

  //   const etapas = ['EXTRACT', 'TRANSFORM', 'LOAD'];
  //   let etapaAtual: keyof typeof resultado | null = null;

  //   const linhas = resposta.split('\n').map(l => l.trim()).filter(Boolean);

  //   for (let i = 0; i < linhas.length; i++) {
  //     const linha = linhas[i];

  //     // Detecta etapa
  //     const matchEtapa = etapas.find(etapa => linha.toUpperCase().startsWith(`**${etapa}**`));
  //     if (matchEtapa) {
  //       etapaAtual = matchEtapa.toLowerCase() as keyof typeof resultado;
  //       continue;
  //     }

  //     // Detecta serviço
  //     if (linha.startsWith('- Serviço:')) {
  //       const servico = linha.replace('- Serviço:', '').trim();
  //       const justificativaLinha = linhas[i + 1];
  //       const justificativa = justificativaLinha?.startsWith('- Justificativa:')
  //         ? justificativaLinha.replace('- Justificativa:', '').trim()
  //         : '';

  //       if (etapaAtual && servico && justificativa) {
  //         resultado[etapaAtual].push({ servico, justificativa });
  //       }
  //     }
  //   }

  //   return resultado;
  // }

  // public formatResponseGPT(texto: string): any {
  //   const resultado: any = {
  //     extract: [],
  //     transform: [],
  //     load: []
  //   };

  //   const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  //   let etapaAtual: keyof any | null = null;
  //   let servicoTemp: string | null = null;

  //   for (let i = 0; i < linhas.length; i++) {
  //     const linha = linhas[i];

  //     if (linha.startsWith('**EXTRACT**')) {
  //       etapaAtual = 'extract';
  //       continue;
  //     } else if (linha.startsWith('**TRANSFORM**')) {
  //       etapaAtual = 'transform';
  //       continue;
  //     } else if (linha.startsWith('**LOAD**')) {
  //       etapaAtual = 'load';
  //       continue;
  //     }

  //     // Match serviço
  //     if (linha.startsWith('-Serviço:') || linha.startsWith('- Serviço:')) {
  //       servicoTemp = linha.replace(/- ?Serviço:/, '').trim();
  //       continue;
  //     }

  //     // Match justificativa
  //     if ((linha.startsWith('-Justificativa:') || linha.startsWith('- Justificativa:')) && servicoTemp && etapaAtual) {
  //       const justificativa = linha.replace(/- ?Justificativa:/, '').trim();

  //       resultado[etapaAtual].push({
  //         servico: servicoTemp,
  //         justificativa
  //       });

  //       servicoTemp = null; // zera para próxima iteração
  //     }
  //   }

  //   return resultado;
  // }

  public formatarRespostaGPTComCusto(texto: string): ArquiteturaComCusto {
    const resultado: ArquiteturaComCusto = {
      extract: [],
      transform: [],
      load: [],
      custoEstimado: {
        detalhado: [],
        total: '0',
        observacao: ''
      }
    };

    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    let etapaAtual: keyof Pick<ArquiteturaComCusto, 'extract' | 'transform' | 'load'> | null = null;
    let servicoTemp: string | null = null;
    let custoSection = false;

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      if (linha.startsWith('**EXTRACT**')) {
        etapaAtual = 'extract';
        custoSection = false;
        continue;
      }
      if (linha.startsWith('**TRANSFORM**')) {
        etapaAtual = 'transform';
        custoSection = false;
        continue;
      }
      if (linha.startsWith('**LOAD**')) {
        etapaAtual = 'load';
        custoSection = false;
        continue;
      }
      if (linha.startsWith('**Estimativa de Custo**')) {
        etapaAtual = null;
        custoSection = true;
        continue;
      }

      if (etapaAtual) {
        if (linha.startsWith('-Serviço:') || linha.startsWith('- Serviço:')) {
          servicoTemp = linha.replace(/- ?Serviço:/, '').trim();
        } else if (
          (linha.startsWith('-Justificativa:') || linha.startsWith('- Justificativa:')) &&
          servicoTemp
        ) {
          const justificativa = linha.replace(/- ?Justificativa:/, '').trim();
          resultado[etapaAtual].push({ servico: servicoTemp, justificativa });
          servicoTemp = null;
        }
      }

      if (custoSection && /^\d+\.\s\*\*/.test(linha)) {
        // Ex: 1. **AWS Glue**: descrição...
        const servicoMatch = linha.match(/\*\*(.+?)\*\*/);
        const servico = servicoMatch ? servicoMatch[1].trim() : '';
        const resto = linha.split('**')[2]?.split(':')[1]?.trim() ?? '';
        const valorMatch = resto.match(/R\$ ?([\d.,]+)/);
        // const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : 0;

        resultado.custoEstimado.detalhado.push({
          servico,
          descricao: resto
        });
      }

      if (linha.startsWith('-Custo total:')) {
        const totalMatch = linha.match(/R\$ ?([\d.,]+)/);
        if(totalMatch)
          resultado.custoEstimado.total = totalMatch[1] || '0'
      }

      if (
        linha.startsWith('Esses custos são estimativas') ||
        linha.toLowerCase().includes('custos são estimativas')
      ) {
        resultado.custoEstimado.observacao = linha;
      }
    }

    return resultado;
  }
}
