import { Component } from '@angular/core';
import { GraphService } from 'src/app/services/graph.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
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
      console.log(res);
      this.tasks = res;
    });
  }
}
