import { Component } from '@angular/core';
import { GraphService } from 'src/app/services/graph.service';

@Component({
  selector: 'app-data-sqare-card',
  templateUrl: './data-sqare-card.component.html',
  styleUrls: ['./data-sqare-card.component.css']
})
export class DataSqareCardComponent {
  public tasks: { success: boolean; error: number; message: string; data: any } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private Graph: GraphService){}

  ngOnInit()
  {
    this.Graph.NumberOfAllTasks().subscribe
    ((res: any) => {
      this.tasks = res;
    });
  }
}
