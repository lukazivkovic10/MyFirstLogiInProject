import { Component, Input, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions,
  ApexResponsive,
  ApexLegend,
  ApexFill
} from "ng-apexcharts";
import { map } from 'rxjs';
import { AnalyticsService } from 'src/app/services/AnalyticsServices/analytics.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-view-graph',
  templateUrl: './view-graph.component.html',
  styleUrls: ['./view-graph.component.css']
})
export class ViewGraphComponent {
  @Input() id: number = 0;
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;
  xAxisCategories: string[] = [];

  constructor(private Analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.Analytics.getViewData(this.id)
    .pipe(
      map((response: any) => {
        // Map the data to the format required by ApexCharts
        const chartData = response.data.map((item: any) => ({
          x: new Date(item.date), // Convert date string to Date object
          y: item.views, // Use views as the data value
        }));

        return chartData;
      })
    )
    .subscribe((chartData: any) => {
        this.chartOptions = {
          series: [
            {
              name: "Ogledi",
              data: chartData,
            }
          ],
          chart: {
            height: 350,
            width: "100%",
            type: "line",
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: "straight"
          },
          title: {
            text: "Število ogledov v zadnjih 7 dneh",
            align: "center"
          },
          grid: {
            row: {
              colors: ["#f3f3f3", "transparent"],
              opacity: 0.5
            }
          },
          xaxis: {
            type: 'datetime', // Set x-axis type to datetime
          }
        };
    });
  }

  ngAfterViewInit(): void {
    if (this.chartOptions) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  getDayLabel(index: number): string {
    // Define an array of day labels
    const dayLabels = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
  
    // Ensure the index is within the bounds of the array
    if (index >= 0 && index < dayLabels.length) {
      return dayLabels[index];
    } else {
      // Handle the case where the index is out of bounds
      return "Unknown";
    }
  }
}
