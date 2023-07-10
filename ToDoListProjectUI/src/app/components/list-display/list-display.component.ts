import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-list-display',
  templateUrl: './list-display.component.html',
  styleUrls: ['./list-display.component.css']
})
export class ListDisplayComponent implements OnInit {
  showModalCreate: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;

  constructor(private auth: AuthService) 
  { };

  ngOnInit() {
  }

  modelOpenCreate() 
  {
    this.showModalCreate = true;
  }

  modelCloseCreate() 
  {
    this.showModalCreate = false;
    window.location.reload();
  }

  modelOpenDelete() 
  {
    this.showModalDelete = true;
  }

  modelCloseDelete() 
  {
    this.showModalDelete = false;
    window.location.reload();
  }

  modelOpenEdit() 
  {
    this.showModalEdit = true;
  }

  modelCloseEdit() 
  {
    this.showModalEdit = false;
    window.location.reload();
  }
}
