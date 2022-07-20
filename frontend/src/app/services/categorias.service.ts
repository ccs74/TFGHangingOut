import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routes, Router, Data } from '@angular/router';
import { categoriaForm } from "../interfaces/nueva-categoria.interface";

@Injectable({
  providedIn: 'root'
})

export class CategoriasService{

  constructor(private http: HttpClient,
              private router: Router) { }


  cargarCategorias(texto?: string, id?: string){
    if(!texto){
      texto ="";
    }
    if(!id){
      return this.http.get(`${environment.base_url}/categorias?texto=${texto}` , this.cabeceras);
    }else{
      return this.http.get(`${environment.base_url}/categorias?id=${id}&texto=${texto}` , this.cabeceras);
    }

  }

  crearCategoria(formData: categoriaForm){
    return this.http.post(`${environment.base_url}/categorias` ,formData, this.cabeceras);
  }

  actualizarCategoria(uid: string, formData: categoriaForm){
    return this.http.put(`${environment.base_url}/categorias/${uid}` ,formData, this.cabeceras);
  }

  borrarCategoria(uid: string){
    return this.http.delete(`${environment.base_url}/categorias/${uid}` , this.cabeceras);
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
