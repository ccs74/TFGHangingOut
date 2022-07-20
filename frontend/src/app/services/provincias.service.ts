import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routes, Router, Data } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class ProvinciaService{


  constructor(private http: HttpClient,
              private router: Router) { }


  cargarProvincias(){
    return this.http.get(`${environment.base_url}/provincias` , this.cabeceras);
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

