import { Component, inject } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { EtlService } from './etl.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { EchartsConfigModule } from '../../module/echarts-config.module';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ArchitectureNameDialogComponent } from '../../components/architecture-name-modal/architecture-name-dialog.component';
import { ArchitectureResultsDisplayComponent } from '../../components/architecture-results-display/architecture-results-display.component';

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
    porEtapa: {
      extract: number;
      transform: number;
      load: number;
    };
  };
  indicadores: {
      escalabilidade: number;
      facilidade: number;
      custoBeneficio: number;
    }
}

interface ArquiteturaSeparada {
  extract: ServiceItem[];
  transform: ServiceItem[];
  load: ServiceItem[];
  visualization: ServiceItem[];
}

const ELEMENT_DATA: any[] = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];

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
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    NgFor,
    EchartsConfigModule,
    ArchitectureResultsDisplayComponent
  ],
  templateUrl: './etl.component.html',
  styleUrl: './etl.component.scss'
})
export class EtlComponent {
  etlForm: FormGroup;
  isLinear = true;
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

  extractSizeSelected = 'gb'
  transformSizeSelected = 'gb'
  loadSizeSelected = 'gb'

  displayedColumns: string[] = ['servico', 'descricao'];
  public dataSource = ELEMENT_DATA;

  chartOptions: any = {}
  chartIndicadores: any = {}

  alreadySaved = false

  private dialog = inject(MatDialog);

  constructor(private fb: FormBuilder, private etlService: EtlService, private toastr: ToastrService) {
    this.etlForm = this.fb.group({
      extract: this.fb.group({
        origin: ['', Validators.required],
        frequency: ['', Validators.required],
        size: [0, Validators.required],
        processingType: ['', Validators.required],
        services: this.fb.array(this.extractServices.map(() => this.fb.control(false)))
      }),
      transform: this.fb.group({
        complexity: ['', Validators.required],
        size: [0, Validators.required],
        frequency: ['', Validators.required],
        processingType: ['', Validators.required],
        duration: ['', Validators.required],
        services: this.fb.array(this.transformServices.map(() => this.fb.control(false)))
      }),
      load: this.fb.group({
        storeLocation: ['', Validators.required],
        needSQL: ['', Validators.required],
        size: [0, Validators.required],
        frequency: ['', Validators.required],
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
    this.toastr.info('Gerando arquitetura...')
    this.isLoading = true

    this.extractServices = this.getSelectedExtractServices()
    this.transformServices = this.getSelectedTransformServices()
    this.loadServices = this.getSelectedLoadServices()

    const msg = `
            Você é um arquiteto de soluções da AWS.
            Com base no cenário a seguir, recomende uma arquitetura ideal para as etapas EXTRACT, TRANSFORM e LOAD. Indique os serviços mais adequados, com justificativas objetivas e realistas.

            ### CENÁRIO:
            - Origem dos dados: ${this.etlForm.value.extract.origin}
            - Frequência de ingestão: ${this.etlForm.value.extract.frequency}
            - Volume por ingestão: ${this.etlForm.value.extract.size} ${this.extractSizeSelected}
            - Tipo de processamento: ${this.etlForm.value.extract.processingType}

            - Nível de complexidade da transformação: ${this.etlForm.value.transform.complexity}
            - Volume médio de dados processado por job: ${this.etlForm.value.transform.size} ${this.transformSizeSelected}
            - Frequência das transformações: ${this.etlForm.value.transform.frequency}
            - Duração média de cada transformação: ${this.etlForm.value.transform.duration}
            - Tipo de processamento: ${this.etlForm.value.transform.processingType}
            - Serviços preferidos (se selecionados): ${this.etlForm.value.transform.services}

            - Destino dos dados após a transformação: ${this.etlForm.value.load.storeLocation}
            - O usuário deseja consultar os dados com SQL: ${this.etlForm.value.load.needSQL}
            - Volume mensal estimado de dados carregados: ${this.etlForm.value.load.size} ${this.transformSizeSelected}
            - Frequência de carga: ${this.etlForm.value.load.frequency}

            ### INSTRUÇÕES:
            - Para a etapa do Extract:
              - Caso os volumes de dados sejam muito altos (como neste exemplo), considere usar **Amazon EC2** na etapa de extração, principalmente se:
                - Há necessidade de controle total do código
                - São executadas rotinas customizadas de hora em hora
                - O volume de dados torna serviços como Lambda ou Glue economicamente inviáveis
                - O **Amazon EC2** deve ser considerado quando o custo-benefício e a flexibilidade justificarem, especialmente em processamento pesado, recorrente ou scripts complexos.
                - Se usar EC2, indique o tipo de instância, estimativa de horas de uso por mês e o custo estimado baseado no preço por hora.
                - Use Amazon S3 como armazenamento intermediário se necessário.
                - Não recomende sempre os mesmos serviços (evite repetir Lambda ou Glue para todo caso). Seja técnico, prático e analítico.
                - Faça os cálculos usando a moeda em dólar ($) SEMPRE

            - Para a etapa do Transform:
              - Baseie a recomendação nas características reais do cenário. Evite respostas genéricas.
              - Considere o uso de AWS Glue, AWS Lambda, Amazon EMR ou Amazon EC2 conforme o perfil da transformação:
                - Se o volume for alto e houver necessidade de controle total, considere EC2.
                - Se forem transformações com pipelines complexos ou integração com catálogo de dados, considere Glue.
                - Se o processamento for simples e rápido, e o volume for baixo, Lambda pode ser viável.
                - Se forem necessárias bibliotecas específicas, como Spark, e o volume justificar, use EMR.
              - O serviço EC2 pode ser preferido quando:
                - O custo do Glue se torna elevado em execuções frequentes
                - Há necessidade de scripts customizados
                - O tempo de execução é previsível e controlável
              - Se recomendar o EC2 ou EMR, especifique:
                - Tipo da instância
                - Horas estimadas de uso no mês
                - Preço por hora e custo estimado mensal (em dólar)
              - Evite recomendar os mesmos serviços sempre, e não use múltiplos serviços se não houver necessidade clara.
              - Seja conservador nas estimativas e explique o motivo de qualquer variação de custo.
              - Se não houver informações suficientes, forneça um intervalo estimado realista, explicando por que o custo pode variar.

            - Para a etapa de Load:
              - Considere Amazon Redshift, Amazon RDS, Amazon S3, Amazon QuickSight, Athena ou DynamoDB, dependendo das necessidades reais do cenário.
              - Se o usuário precisa de SQL e dashboards, recomende serviços como Amazon Redshift (para análises complexas).
              - Evite recomendar serviços caros como Redshift se o volume for pequeno ou o uso simples. Prefira S3 + Athena ou RDS nesses casos.
              - Se for usar Redshift, especifique o tipo de nó, como dc2.large ou ra3.xlplus, e baseie o custo no número de horas mensais.
              - Seja conservador nas estimativas.
              - Nunca recomende serviços desnecessários ou instâncias caras sem justificativa

            ⚠️ IMPORTANTE:
            - Avalie se EC2 é necessário de forma realista.
            - CUIDADO PARA NÃO EXAGERAR NA ESCOLHA DA INSTÂNCIA EC2. AVALIE COM CAUTELA SEMPRE!
            - Se for, indique o tipo da instância mais adequada, o motivo técnico, e o custo por hora e mensal.
            - Evite sugerir instâncias exageradas como c5.4xlarge sem justificativa forte.
            - Se o volume de dados for inferior a 500 MB por job e a frequência de ingestão for até uma vez por hora, recomende AWS Lambda + Amazon S3. Acima disso, considere Amazon EC2 ou Kinesis Data Streams como alternativas mais robustas.
            - Use SEMPRE 2 casas DECIMAIS no MÁXIMO ao colocar qualquer valor

            Quando for colocar o titulo EXTRACT, deixe o título assim **EXTRACT**.
            Quando for colocar o titulo TRANSFORM, deixe apenas o título **TRANSFORM**.
            Quando for colocar o titulo LOAD, deixe apenas o título **LOAD**.
            Quando for colocar o nome do serviço deixe -Serviço: <nome do serviço>
            Quando for colocar a justificativa coloque -Justificativa <justificativa do serviço>

            Explique corretamente a base de calculo de cada serviço recomendado.

            ----------------

            Segue um exemplo de estrutura a ser seguido para TODAS AS OCASIÕES:

            **EXTRACT**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            etc... se houver mais

            **TRANSFORM**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            etc... se houver mais

            **LOAD**

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            -Serviço: <nome do serviço aceito>
            -Justificativa: <justificativa>

            etc... se houver mais

            ## IMPORTANTE!! NÃO FALHE!

            NUNCA COLOQUE DOIS PONTOS ":". EXEMPLO -> "Custo:" ou "Total:"

            **Indicador de escalabilidade ou eficiência**

            - Escalabilidade <Dê uma nota de 0 a 10 para a ESCALABILIDADE da ARQUITETURA gerada>
            - Facilidade <Dê uma nota de 0 a 10 para a FACILIDADE da ARQUITETURA gerada>
            - Custo-benefício <Dê uma nota de 0 a 10 para o Custo-benefício da ARQUITETURA gerada>

            **Justificativa Geral**

            - Justificativa Geral: <Faça uma justificativa completa e detalhada, com base nos dados fornecidos, do por que essa arquitetura foi recomendada>

            **Estimativa de Custo**

            IMPORTANTE: Usar sempre duas casas decimais no MÁXIMO. Usar sempre como está no formato abaixo:

            *EXTRACT*
            1. **<nome do serviço da aws>**: <explicação DETALHADA da base de calculo>.
            Custo -> <valor final do calculo SEMPRE e SEMPRE NESTA POSIÇÃO, ABAIXO DO 1.>

            repita... se houver mais

            *TRANSFORM*
            2. **<nome do serviço da aws>**: <explicação DETALHADA da base de calculo>. <valor final do calculo SEMPRE e APENAS>
            Custo -> <valor final do calculo SEMPRE e SEMPRE NESTA POSIÇÃO, ABAIXO DO 2.>

            repita... se houver mais

            *LOAD*
            3. **<nome do serviço da aws>**: <explicação DETALHADA da base de calculo>. <valor final do calculo SEMPRE e APENAS>
            Custo -> <valor final do calculo SEMPRE e SEMPRE NESTA POSIÇÃO, ABAIXO DO 3.>

            repita... se houver mais
      `

      console.log(msg)

    this.etlService.getRecommendationsAI({
      prompt: msg
    }).subscribe({
      next: (result: string) => {
        // this.results = result;
        this.alreadySaved = false
        console.log('Recomendações:', result);
        this.results = this.formatarRespostaGPTComCusto(result);
        console.log(this.results)

        this.dataSource = this.results.custoEstimado.detalhado.map((e: any) => ({
          servico: e.servico,
          descricao: e.descricao
        }))

        const extractData = {
          "origin": this.etlForm.value.extract.origin,
          "frequency": this.etlForm.value.extract.frequency,
          "processingType": this.etlForm.value.extract.processingType,
          "size": this.etlForm.value.extract.size,
          "extractSizeSelected": this.extractSizeSelected
        }

        const transformData = {
          "complexity": this.etlForm.value.transform.complexity,
          "frequency": this.etlForm.value.transform.frequency,
          "duration": this.etlForm.value.transform.duration,
          "processingType": this.etlForm.value.transform.processingType,
          "size": this.etlForm.value.transform.size,
          "transformSizeSelected": this.transformSizeSelected
        }

        const loadData = {
          "storeLocation": this.etlForm.value.load.storeLocation,
          "needSQL": this.etlForm.value.load.needSQL,
          "frequency": this.etlForm.value.load.frequency,
          "size": this.etlForm.value.load.size,
          "loadSizeSelected": this.loadSizeSelected
        }

        this.results = {
          ...this.results,
          extractData,
          transformData,
          loadData,
        }

        console.log(this.results)
        console.log('veio aq')

        // console.log(this.chartOptions)

        this.isLoading = false

        this.toastr.success('Arquitetura gerada com sucesso.')
      },
      error: (err: any) => {
        console.error('Erro ao buscar recomendações:', err);
      }
    });
  }

  public saveResult() {
    if(this.alreadySaved) {
      this.toastr.error('Você já salvou esta arquitetura.')

      return
    }

    const dialogRef = this.dialog.open(ArchitectureNameDialogComponent, {
      width: '400px',
      data: { name: '' }
    });

    dialogRef.afterClosed().subscribe(architectureName => {
      if (architectureName) {
        console.log('Nome da arquitetura:', architectureName);

        const extractData = {
          "origin": this.etlForm.value.extract.origin,
          "frequency": this.etlForm.value.extract.frequency,
          "processingType": this.etlForm.value.extract.processingType,
          "size": this.etlForm.value.extract.size,
          "extractSizeSelected": this.extractSizeSelected
        }

        const transformData = {
          "complexity": this.etlForm.value.transform.complexity,
          "frequency": this.etlForm.value.transform.frequency,
          "duration": this.etlForm.value.transform.duration,
          "processingType": this.etlForm.value.transform.processingType,
          "size": this.etlForm.value.transform.size,
          "transformSizeSelected": this.transformSizeSelected
        }

        const loadData = {
          "storeLocation": this.etlForm.value.load.storeLocation,
          "needSQL": this.etlForm.value.load.needSQL,
          "frequency": this.etlForm.value.load.frequency,
          "size": this.etlForm.value.load.size,
          "loadSizeSelected": this.loadSizeSelected
        }

        this.etlService.saveRecommendations({
          architectureName,
          extractData: JSON.stringify(extractData),
          transformData: JSON.stringify(transformData),
          loadData: JSON.stringify(loadData),
          responseAI: JSON.stringify(this.results)
        }).subscribe({
          next: (result: string) => {
            this.alreadySaved = true
            this.toastr.success('Arquitetura salva com sucesso.')
          }
        })
      } else {
        console.log('Salvamento cancelado.');
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
      observacao: '',
      porEtapa: {
        extract: 0,
        transform: 0,
        load: 0
      }
    },
    indicadores: {
      escalabilidade: 0,
      facilidade: 0,
      custoBeneficio: 0
    }
  };

  const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);

  let etapaAtual: 'extract' | 'transform' | 'load' | null = null;
  let etapaCustoAtual: 'extract' | 'transform' | 'load' | null = null;
  let inCustoSection = false;
  let servicoTemp: string | null = null;

  for (let linha of linhas) {
    // Detecta título de etapa
    if (linha.startsWith('**EXTRACT**')) {
      etapaAtual = 'extract';
      inCustoSection = false;
      continue;
    }
    if (linha.startsWith('**TRANSFORM**')) {
      etapaAtual = 'transform';
      inCustoSection = false;
      continue;
    }
    if (linha.startsWith('**LOAD**')) {
      etapaAtual = 'load';
      inCustoSection = false;
      continue;
    }
    if (linha.startsWith('**Estimativa de Custo**')) {
      etapaAtual = null;
      inCustoSection = true;
      continue;
    }

    // Detecta etapa de custo
    if (inCustoSection && linha.startsWith('*EXTRACT*')) {
      etapaCustoAtual = 'extract';
      continue;
    }
    if (inCustoSection && linha.startsWith('*TRANSFORM*')) {
      etapaCustoAtual = 'transform';
      continue;
    }
    if (inCustoSection && linha.startsWith('*LOAD*')) {
      etapaCustoAtual = 'load';
      continue;
    }

    // Captura serviço
    if (etapaAtual && (linha.startsWith('-Serviço:') || linha.startsWith('- Serviço:'))) {
      servicoTemp = linha.replace(/- ?Serviço:/, '').trim();
      continue;
    }

    // Captura justificativa
    if (etapaAtual && servicoTemp && (linha.startsWith('-Justificativa:') || linha.startsWith('- Justificativa:'))) {
      const justificativa = linha.replace(/- ?Justificativa:/, '').trim();
      resultado[etapaAtual].push({ servico: servicoTemp, justificativa });
      servicoTemp = null;
      continue;
    }

    // Captura custo detalhado
    if (inCustoSection && /^\d+\.\s\*\*/.test(linha)) {
      const servicoMatch = linha.match(/\*\*(.+?)\*\*/);
      const servico = servicoMatch ? servicoMatch[1].trim() : '';
      const descricao = linha.split('**')[2]?.split(':')[1]?.trim() ?? '';
      resultado.custoEstimado.detalhado.push({ servico, descricao });
      continue;
    }

    // Captura valor individual por etapa
    if (inCustoSection && etapaCustoAtual && linha.includes('Custo ->')) {
      const valorMatch = linha.match(/Custo\s*->\s*\$?([\d.,]+)/);
      if (valorMatch) {
        const valor = parseFloat(valorMatch[1].replace(/,/g, ''));
        resultado.custoEstimado.porEtapa[etapaCustoAtual] = valor;
      }
      continue;
    }

    // Custo total final
    if (linha.startsWith('-Custo total:')) {
      const totalMatch = linha.match(/R\$ ?([\d.,]+)/);
      if (totalMatch) {
        resultado.custoEstimado.total = totalMatch[1];
      }
      continue;
    }

    // Observação final
    if (
      linha.startsWith('Esses custos são estimativas') ||
      linha.toLowerCase().includes('custos são estimativas')
    ) {
      resultado.custoEstimado.observacao = linha;
      continue;
    }

    // Indicadores de eficiência
    if (linha.toLowerCase().includes('escalabilidade')) {
      const match = linha.match(/escalabilidade\s+(\d+)/i);
      if (match) resultado.indicadores!.escalabilidade = Number(match[1]);
    }
    if (linha.toLowerCase().includes('facilidade')) {
      const match = linha.match(/facilidade\s+(\d+)/i);
      if (match) resultado.indicadores!.facilidade = Number(match[1]);
    }
    if (linha.toLowerCase().includes('custo-benefício')) {
      const match = linha.match(/custo-benefício\s+(\d+)/i);
      if (match) resultado.indicadores!.custoBeneficio = Number(match[1]);
    }
  }

  return resultado;
}
}
