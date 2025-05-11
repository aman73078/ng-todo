import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { ToastrService } from 'ngx-toastr';
@Injectable({
    providedIn:'root',
})
export class AppSettingsService{
  
    apiUrl:string = `http://localhost:3005/`;
    constructor(private http:HttpClient, private toastr:ToastrService){}
    toastConfi: any = {
      closeButton: true,
      timeOut: 3000, 
      progressBar: true, 
      positionClass: 'toast-top-right'
    }
    getTaskList(queryParam:any){
      console.log(queryParam,'asfjlskadjfklasdkfjasdk');
      
      return this.http.post(`${this.apiUrl}task/list`,queryParam).pipe(
        map((res:any)=>{
          console.log('res-----------',res);
                return {items: res.data.rows,totalCount: res.data.count}
            })
        );
    }

    createTask(param:any){
        return this.http.post(`${this.apiUrl}task/create-task`,param);
    }

    updateTask(param:any,taskId:number){
      return this.http.patch(`${this.apiUrl}task/update-task/${taskId}`,param);
    }

    deleteTask(taskId:number){
      return this.http.delete(`${this.apiUrl}task/${taskId}`);
    }
    showError(message: string) {
      this.toastr.error(message,'Error!',{...this.toastConfi});
    }
      
    showSuccess(message: string) {
      this.toastr.success(message,'Success!',{...this.toastConfi});
    }

    showWarning(message:string){
      this.toastr.warning(message,'Warning!',{...this.toastConfi})
    }
}