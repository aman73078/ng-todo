import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { CommonModule, DatePipe } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { AppSettingsService } from './app-settings.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ReactiveFormsModule,FormlyModule,FormlyBootstrapModule,CommonModule,
    InfiniteScrollDirective,DatePipe,FormsModule,NgbDatepickerModule,JsonPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'ToDo App';
  taskList:any[] = [];
  form: FormGroup = new FormGroup({});
  model:any = {};
  fields: FormlyFieldConfig[] = [];
  isEdit:boolean = false;
  taskId:number = 0;
  searchText:string = '';
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('dateDropdown') dateDropDown! : ElementRef;

  constructor(private appSettingsService:AppSettingsService){}
  ngOnInit(){
    this.getFormFields();
	let param = {
		filter:{
			queryString: this.searchText,
			queryField: this.dropdown?.nativeElement?.value,
			uploadedDate:{from:'',to:''},
		}
	}
	this.appSettingsService.getTaskList(param).subscribe((res:any) => {
		console.log('res--------------',res);
		this.taskList = res.items;
	})
  }

  getFormFields(){
    this.fields = [
      {
        fieldGroup:[
          {
            className:'row',
            key:'taskName',
            type:'textarea',
            templateOptions:{
              label:'',
              placeholder:'Add new task',
              rows:2,
              required:true
            },
			validation: {
				messages: {
				  required: 'This field is required',
				}
			  }
          },
          {
            fieldGroupClassName:'row',
            fieldGroup:[
              {
                className:'col-4',
                key:'dueDate',
                type:'input',
                templateOptions:{
                  placeholder:'Due Date - MM/DD/YYYY',
                  required:true
                },
				validators:{
					dueDate : {
						expression : (c:AbstractControl) => /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(c.value),
						message: (event:any, field:FormlyFieldConfig) => 'Please follow this pattern "MM/DD/YYYY"'
					}
				},
				validation: {
					messages: {
					  required: 'This field is required',
					}
				  }
              },
              {
                className:'col-8',
                key:'tags',
                type:'input',
                templateOptions:{
                  placeholder:'Enter comma seperated tags',
                  required:true
                },
				validation: {
					messages: {
					  required: 'This field is required',
					}
				  }
              }
            ]
          }
          
        ]
      }
    ]
  }

  loadItem(queryParam?:any){
	this.appSettingsService.getTaskList(queryParam).subscribe((res:any) => {
		console.log('res--------------',res);
		this.taskList = res.items;
	})
  }

  onEdit(task:any){
	console.log('task----------',task);
	this.isEdit = true;
	this.taskId = task.id
	this.model = {
		taskName: task.taskName,
		dueDate: task.dueDate,
		tags: task.tags
	}
  }

  removeTask(taskId:number){
	this.appSettingsService.deleteTask(taskId).subscribe((res:any) =>{
		if(res.status){
			this.appSettingsService.showSuccess(res.message);
			this.loadItem();
		}
	})
  }

  search(){
	console.log('search----------',this.searchText,this.dropdown.nativeElement.value);
	let param = {
		filter:{
			queryString: this.searchText.trim(),
			queryField: this.dropdown.nativeElement.value
		}
	}
	this.loadItem(param);
  }

  onSearchTextChange(value: string) {
	this.searchText = value.trim(); 
  }

  clearFilter(){
	this.searchText = ''
	this.loadItem({filter:{ queryField:'',queryString:''}})
  }

  submit(){
    if(this.form.valid){
		
      console.log('param----',this.model);
	  let param = {
		taskName: this.model.taskName,
		dueDate: this.model.dueDate,
		tags: this.model.tags,
		taskDescription: this.model.taskDescription ? this.model.taskDescription : '',
		isCompleted: false, 
	  }
	  if(!this.isEdit){
		  this.appSettingsService.createTask(param).subscribe((res:any) =>{
			if(res.status){
				console.log('res---------------',res)
				this.loadItem()
				this.appSettingsService.showSuccess(res.message);
			}else{
				this.appSettingsService.showError(res.message)
			}
			this.reset()
		  })
	  }else{
		this.appSettingsService.updateTask(param,this.taskId).subscribe((res:any) => {
			if(res.status){
				console.log('res---------------',res);
				this.loadItem()
				this.appSettingsService.showSuccess(res.message);
			}else{
				this.appSettingsService.showError(res.message)
			}	
			this.reset()
		})
		this.isEdit = false;
	  }
    }else{
		this.appSettingsService.showError('Invalid Forms')
	}
  }

  onScroll() {
    console.log('scrolled!!');
  }
  
  reset(){
	this.model = {};
	this.isEdit = false;
	this.form.reset()	
  }
}
