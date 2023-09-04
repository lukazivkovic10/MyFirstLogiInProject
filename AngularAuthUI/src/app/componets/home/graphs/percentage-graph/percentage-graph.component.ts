import { Component, ViewChild } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ChartComponent,
  ApexFill
} from "ng-apexcharts";
import { GraphService } from 'src/app/services/graph.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
};

@Component({
  selector: 'app-percentage-graph',
  templateUrl: './percentage-graph.component.html',
  styleUrls: ['./percentage-graph.component.css']
})
export class PercentageGraphComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;
  public items: { success: boolean; error: number; message: string; data: number } = {
    success: false,
    error: 0,
    message: '',
    data: 0
  };

  constructor(private graphService: GraphService) {
    this.chartOptions = {
      series: [], // Initialize with an empty array
      chart: {
        height: 350,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%'
          }
        }
      },
      labels: ['Uspešnost v 31 dneh'],
      fill: {
        opacity: 1,
        colors: ['hsl(141, 53%, 31%)']
      }
    };
  }

  ngOnInit() {
    this.graphService.PercentageData().subscribe((res: any) => {
      this.items = res;
      this.chartOptions.series = [this.items.data]; // Set the series data from API response
    });
  }
}
