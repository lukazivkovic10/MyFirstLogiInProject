import { Component, ViewChild } from '@angular/core';
import { GraphService } from 'src/app/services/graph.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexLegend,
  ApexFill
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};

@Component({
  selector: 'app-stacked-graph',
  templateUrl: './stacked-graph.component.html',
  styleUrls: ['./stacked-graph.component.css']
})
export class StackedGraphComponent {
  public chartOptions!: Partial<ChartOptions> | any;

  @ViewChild("chart") chart!: ChartComponent;

  constructor(private graphService: GraphService) {}

  ngOnInit() {
    this.graphService.StackedData().subscribe(
      (data: any) => {
        if (Array.isArray(data.data)) {
          const currentDate = data.data[0].currentDate;
          const startingDate = data.data[0].startingDate;
          const FullDate = ("Od: " + currentDate + " do: " + startingDate);
          
          this.chartOptions = {
            series: data.data.map((item: any) => {
              if (item.name) {
                const dataValue = Array.isArray(item.data) ? item.data : [item.data];
                return {
                  name: item.name,
                  data: dataValue
                };
              } else {
                console.error('Nepravilna oblika v item:', item);
                return null;
              }
            }).filter((item: any) => item !== null),
          chart: {
            type: "bar",
            height: 350,
            stacked: true,
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            },
            dropShadow: {
              enabled: true,
              top: 5,
              left: 2,
              blur: 2,
              opacity: 0.2
            }
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: "bottom",
                  offsetX: -10,
                  offsetY: 0
                }
              }
            }
          ],
          plotOptions: {
            bar: {
              horizontal: false,
              borderRadius: 5
            }
          },
          xaxis: {
            type: "category",
            categories: [FullDate]
          },
          legend: {
            show: true,
            position: "bottom",
            horizontalAlign: 'center',
            offsetY: 0,
            labels: {
              colors: ['hsl(141, 53%, 31%)', 'hsl(217, 71%, 45%)', 'hsl(348, 86%, 43%)']
            },
            markers: {
              width: 12,
              height: 12,
              strokeWidth: 0,
              strokeColor: '#fff',
              fillColors:  ['hsl(141, 53%, 31%)', 'hsl(217, 71%, 45%)', 'hsl(348, 86%, 43%)'],
              radius: 12,
              offsetX: 0,
              offsetY: 0
          },
          },
          fill: {
            opacity: 1,
            colors: ['hsl(141, 53%, 31%)', 'hsl(217, 71%, 45%)', 'hsl(348, 86%, 43%)']
          },
        };
      }else {
        console.error('Nepravilna oblika:', data);
      }
    }
    );
  }
};
