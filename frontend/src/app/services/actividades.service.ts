import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routes, Router, Data } from '@angular/router';
import { nuevaActividadForm } from "../interfaces/nueva-actividad.interface";

@Injectable({
  providedIn: 'root'
})

export class ActividadesService{


  constructor(private http: HttpClient,
              private router: Router) { }


  cargarActividad(uid: string){
    return this.http.get(`${environment.base_url}/actividades/${uid}` , this.cabeceras);
  }

  cargarActividades(texto?: string, lugar?: string, intereses?: string, min?: any, max?: any, fecha?: string, ordenar?: any, domingo?: any){
    if(!texto){ texto = ""; }
    if(!lugar){ lugar = ""; }
    if(!intereses){ intereses = "";}
    if(!min){ min = "";}
    if(!max){ max = "";}
    if(!fecha){ fecha = "";}
    if(!ordenar){ ordenar = "";}
    if(!domingo){ domingo = ""; }
    return this.http.get(`${environment.base_url}/actividades?texto=${texto}&lugar=${lugar}&intereses=${intereses}&min=${min}&max=${max}&fecha=${fecha}&ordenar=${ordenar}&domingo=${domingo}` , this.cabeceras);
  }

  crearActividad(formData: nuevaActividadForm){
    return this.http.post(`${environment.base_url}/actividades`, formData, this.cabeceras);
  }

  actualizarActividad(uid: string, formData: nuevaActividadForm){
    return this.http.put(`${environment.base_url}/actividades/${uid}`, formData, this.cabeceras);
  }

  marcarFavorito(uid: string, idActividad: string, fav: boolean){
    return this.http.put(`${environment.base_url}/actividades/${uid}/${idActividad}/${fav}?token=${this.token}`, this.cabeceras);
  }

  marcarAsistencia(uid: string, idActividad: string, asistir: boolean): Observable<Object>{
    return this.http.put(`${environment.base_url}/actividades/${uid}/${idActividad}/marcar/asistencia/${asistir}?token=${this.token}`, this.cabeceras);
  }

  borrarActividad(uid: string){
    return this.http.delete(`${environment.base_url}/actividades/${uid}`, this.cabeceras);
  }

  subirFotos(uid:string, fd: FormData): Observable<Object>{
    return this.http.put(`${environment.base_url}/actividades/subir/imagenes/actividad/${uid}`, fd, this.cabeceras);
  }

  borrarFotos(uid: string): Observable<Object>{
    return this.http.delete(`${environment.base_url}/actividades/fotos/${uid}`, this.cabeceras);
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

