import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.css']
})
export class ModelContentComponent implements OnInit{
  createForm!: FormGroup;
  constructor(private auth: AuthService,private fb: FormBuilder) 
  { };
  ngOnInit() {
    this.createForm = this.fb.group({
      tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: ['',Validators.required]
    })
  }
}
