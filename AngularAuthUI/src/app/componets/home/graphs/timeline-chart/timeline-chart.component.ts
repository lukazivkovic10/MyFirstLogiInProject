import { Component, ViewChild } from '@angular/core';
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
import { GraphService } from 'src/app/services/graph.service';

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

interface Item
{
  id: number;
  tag: string;
  itemName: string;
  itemDesc: string;
  itemStatus: number;
  active: number;
  createdDate: Date;
  completeDate: Date;
  dateOfCompletion: Date;
  TimeTakenSeconds: number;
  TimeTaken: string;
  FormattedDateOfCompletion: string;
  FormattedCreatedDate: string;
}


@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.css']
})

export class TimelineChartComponent {
  public chartOptions!: Partial<ChartOptions> | any;

  @ViewChild("chart") chart!: ChartComponent;

  public items: { success: boolean; error: number; message: string; data: Item[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private graphService: GraphService) 
  {}

  ngOnInit() {
    this.graphService.TimelineData().subscribe((data: any) => {
      const chartData = data.data.map((item: any) => ({
        x: [item.tag, item.itemName],
        y: [
          new Date(item.formattedCreatedDate).getTime(),
          new Date(item.formattedDateOfCompletion).getTime(),
        ],
        fillColor: "hsl(141, 53%, 31%)",
        itemName: item.itemName, // Store itemName for data label
        completeDate: item.completeDate,
        TimeTaken: item.timeTaken
      }));

      this.chartOptions = {
        series: [{ data:chartData }],
        chart: {
          height: 450,
          type: "rangeBar"
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            dataLabels: {
              hideOverflowingLabels: true
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (value: any, { seriesIndex, dataPointIndex }: { seriesIndex: number, dataPointIndex: number }): string {
            const dataPoint = chartData[dataPointIndex];
            const formattedDate = 'Rok: ' + dataPoint.completeDate;
            const formattedTimeTaken = '| Opravljeno v ' + dataPoint.TimeTaken;
            return formattedDate + '\n' + formattedTimeTaken;
          },
          style: {
            colors: ["white"],
          },
        },
        xaxis: {
          type: "datetime"
        },
        yaxis: {
          show: false
        },
        grid: {
          row: {
            colors: ["#f3f4f5", "#fff"],
            opacity: 1
          }
        }
      };
    })
  }
}
