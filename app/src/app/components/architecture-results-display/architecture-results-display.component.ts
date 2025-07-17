// src/app/architecture-results-display/architecture-results-display.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importe CurrencyPipe
import { MatCardModule } from '@angular/material/card'; // Para os cartões ETL
import { MatTabsModule } from '@angular/material/tabs'; // Para as abas
import { MatButtonModule } from '@angular/material/button'; // Para botões (se houver no template)
import { MatIconModule } from '@angular/material/icon'; // Para ícones (se houver no template)
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // Para a tabela de detalhes
import { EchartsConfigModule } from '../../module/echarts-config.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import { EtlService } from '../../pages/etl/etl.service';
import { MatDialog } from '@angular/material/dialog';
import { ArchitectureNameDialogComponent } from '../architecture-name-modal/architecture-name-dialog.component';

// Importe a interface ParsedArchitecture do seu serviço
// import { SavedArchitecture } from '../arquiteturas-salvas/arquiteturas-salvas.service';
// Se a sua arquitetura salva no service tem os campos parseados em 'parsedExtract', etc.
// use uma interface que inclua eles, como você tinha em ParsedArchitecture.
// Por exemplo:
interface DisplayArchitecture {
  parsedExtract: { origin: string; frequency: string; processingType: string; size: number; extractSizeSelected: string; };
  parsedTransform: { complexity: string; frequency: string; duration: string; processingType: string; size: number; transformSizeSelected: string; };
  parsedLoad: { storeLocation: string; needSQL: string; frequency: string; size: number; loadSizeSelected: string; };
  // Adicione outras propriedades de resultados (chartOptions, chartIndicadores, dataSource para detalhes)
  chartOptions?: any;
  chartIndicadores?: any;
  detailsTableData?: any[]; // Se a tabela de detalhes tiver uma fonte de dados específica
}


@Component({
  selector: 'app-architecture-results-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule, // Se o botão de salvar estiver aqui
    MatIconModule,   // Se o ícone de salvar estiver aqui
    MatTableModule,  // Para a tabela de detalhes
    CurrencyPipe,
    EchartsConfigModule,
    MatTooltipModule,
    ArchitectureNameDialogComponent
  ],
  providers: [CurrencyPipe], // Forneça o CurrencyPipe se for usá-lo dentro deste componente
  templateUrl: './architecture-results-display.component.html',
  styleUrls: ['./architecture-results-display.component.scss']
})
export class ArchitectureResultsDisplayComponent implements OnInit, OnChanges {
  // @Input para receber os dados da arquitetura do componente pai
  @Input() architectureResults: any | null = null;
  @Input() isDetails?: boolean = false

  // Propriedades para a tabela de detalhes (seção 'Detalhes')
  displayedColumns: string[] = ['servico', 'descricao'];
  dataSource = new MatTableDataSource<any>(); // Usar MatTableDataSource para a tabela de detalhes

  // Propriedades para os gráficos (se você estiver usando Echarts ou similar)
  chartOptions: any;
  chartIndicadores: any;

  private dialog = inject(MatDialog);

  constructor(private currencyPipe: CurrencyPipe, private etlService: EtlService) { }

  ngOnInit(): void {
    // A lógica de inicialização aqui pode ser mínima, pois os dados vêm do @Input
  }

  // ngOnChanges é chamado sempre que um @Input muda
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['architectureResults'] && this.architectureResults) {
      console.log(this.architectureResults);
      // Aqui você pode processar os dados recebidos, se necessário
      // Por exemplo, se os dados dos gráficos ou da tabela de detalhes vêm dentro de 'architectureResults':

      // Assumindo que architectureResults.detailsTableData é onde os dados da tabela estão
      if (this.architectureResults.detailsTableData) {
        this.dataSource.data = this.architectureResults.detailsTableData;
      // } else if (this.architectureResults.details && Array.isArray(this.architectureResults.details.costDetails)) {
        // Se os detalhes da tabela vêm de 'details.costDetails'
        //  this.dataSource.data = this.architectureResults.details.costDetails;
      } else {
         this.dataSource.data = []; // Limpa se não houver dados
      }

      this.dataSource = this.architectureResults.custoEstimado.detalhado.map((e: any) => ({
        servico: e.servico,
        descricao: e.descricao
      }))

      // Atribui as opções dos gráficos se vierem nos resultados
      // this.chartOptions = this.architectureResults.chartOptions;
      // this.chartIndicadores = this.architectureResults.chartIndicadores;

      this.chartOptions = {
        title: {
          text: 'Custos por Etapa (em US$)',
          left: 'center'
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Extract', 'Transform', 'Load']
        },
        yAxis: {
          type: 'value',
          name: 'Custo (US$)'
        },
        series: [
          {
            type: 'bar',
            data: [
              this.architectureResults.custoEstimado.porEtapa.extract,
              this.architectureResults.custoEstimado.porEtapa.transform,
              this.architectureResults.custoEstimado.porEtapa.load
            ],
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      };

      this.chartIndicadores = {
        title: {
          text: 'Indicadores de Arquitetura',
          left: 'center'
        },
        tooltip: {},
        radar: {
          indicator: [
            { name: 'Escalabilidade', max: 10 },
            { name: 'Facilidade', max: 10 },
            { name: 'Custo-benefício', max: 10 }
          ]
        },
        series: [
          {
            name: 'Indicadores',
            type: 'radar',
            data: [
              {
                value: [
                  this.architectureResults?.indicadores?.escalabilidade ?? 0,
                  this.architectureResults?.indicadores?.facilidade ?? 0,
                  this.architectureResults?.indicadores?.custoBeneficio ?? 0
                ],
                name: 'Arquitetura Avaliada'
              }
            ],
            areaStyle: {}
          }
        ]
      };

      // Se o custo total não estiver diretamente em architectureResults.totalCost,
      // e sim em results.totalCost, você precisará adaptar como ele é passado.
    }
  }

  reload() {
    window.location.reload()
  }

  saveArch() {
    // if(this.alreadySaved) {
    //   this.toastr.error('Você já salvou esta arquitetura.')

    //   return
    // }

    const dialogRef = this.dialog.open(ArchitectureNameDialogComponent, {
      width: '400px',
      data: { name: '' }
    });

    dialogRef.afterClosed().subscribe(architectureName => {
      if(architectureName) {
        const responseAI = {
          custoEstimado: this.architectureResults.custoEstimado,
          extract: this.architectureResults.extract,
          transform: this.architectureResults.transform,
          load: this.architectureResults.load,
          indicadores: this.architectureResults.indicadores
        }

        this.etlService.saveRecommendations({
          architectureName,
          extractData: JSON.stringify(this.architectureResults.extractData),
          transformData: JSON.stringify(this.architectureResults.transformData),
          loadData: JSON.stringify(this.architectureResults.loadData),
          responseAI: JSON.stringify(responseAI)
        }).subscribe({
          next: (result: string) => {
            console.log(result)
            // this.alreadySaved = true
            // this.toastr.success('Arquitetura salva com sucesso.')
          }
        })
      } else {
        console.log('Salvamento cancelado.');
      }
    })
  }

  // Você pode ter um EventEmitter para notificar o pai se o botão de salvar estiver aqui
  // @Output() saveRequest = new EventEmitter<void>();
  // onSave(): void {
  //   this.saveRequest.emit();
  // }
}
