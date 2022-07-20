import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routes, Router, Data } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class IncidenciaService{


  constructor(private http: HttpClient,
              private router: Router) { }


  cargarIncidencias(id?: string){
    if(!id){
      id = "";
    }
    console.log(id);
    return this.http.get(`${environment.base_url}/incidencias?id=${id}` , this.cabeceras);
  }

  denunciar(formData: Data){
    return this.http.post(`${environment.base_url}/incidencias`, formData, this.cabeceras);
  }

  resolver(uid: any, solucion: string){
    return this.http.put(`${environment.base_url}/incidencias/${uid}/${solucion}?token=${this.token}`, this.cabeceras);
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }
}
