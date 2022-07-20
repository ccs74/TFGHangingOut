import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routes, Router, Data } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class ChatService{

  constructor(private http: HttpClient,
              private router: Router) { }


  cargarChats(id?: string){
    return this.http.get(`${environment.base_url}/chats/${id}` , this.cabeceras);
  }

  chatOActividad(id: string){
    return this.http.get(`${environment.base_url}/chats/tengo/chat/actividad/${id}`, this.cabeceras);
  }

  obtenerChat(id1: string, id2: string, act: string){
    return this.http.get(`${environment.base_url}/chats/${id1}/${id2}/${act}` , this.cabeceras);
  }

  crearChat(formData: Data){
    return this.http.post(`${environment.base_url}/chats` ,formData, this.cabeceras);
  }

  actualizarChat(uid: string, formData: Data){
    return this.http.put(`${environment.base_url}/chats/${uid}` ,formData, this.cabeceras);
  }

  borrarChat(uid: string){
    return this.http.delete(`${environment.base_url}/chats/${uid}` , this.cabeceras);
  }

  calcularDias(fecha: Date){
    return this.http.get(`${environment.base_url}/chats/diferenciaDias/${fecha}` , this.cabeceras);
  }

  cargarMensajes(idChat: string, idUsuario: string){
    return this.http.get(`${environment.base_url}/mensajes/${idChat}/${idUsuario}` , this.cabeceras);
  }

  enviarMensaje(idChat: string, formData: Data){
    return this.http.post(`${environment.base_url}/mensajes/${idChat}` ,formData, this.cabeceras);
  }

  borrarMensaje(idMensaje: string){
    return this.http.delete(`${environment.base_url}/mensajes/${idMensaje}` , this.cabeceras);
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
