import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from '../models/usuario.model';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Routes, Router, Data } from '@angular/router';
import { loginForm } from "../interfaces/login-form.interface";
import { registroForm } from "../interfaces/registro-form.interface";

@Injectable({
  providedIn: 'root'
})

export class UsuarioService{

  private usuario!: Usuario;

  constructor(private http: HttpClient,
              private router: Router) { }

  cargarUsuario(uid?: string, email?: string){
    if(uid == ""){
      uid = "nose";
    }
    return this.http.get(`${environment.base_url}/usuarios/${uid}?email=${email}` , this.cabeceras);
  }

  cargarUsuarios(texto?: string, lugar?: string, min?: any, max?: any){
    if(!texto){
      texto = "";
    }
    if(!lugar){
      lugar = "";
    }
    if(!min){
      min = "";
    }
    if(!max){
      max = "";
    }
    return this.http.get(`${environment.base_url}/usuarios?texto=${texto}&poblacion=${lugar}&min=${min}&max=${max}` , this.cabeceras);
  }

  actualizarUsuario( uid: string, formData: registroForm){
    return this.http.put(`${environment.base_url}/usuarios/${uid}`, formData, this.cabeceras);
  }

  cambiarEstado(uid: string){
    return this.http.put(`${environment.base_url}/usuarios/cambiarEstado/${uid}`, this.cabeceras);
  }

  borrarUsuario(uid: string){
    return this.http.delete(`${environment.base_url}/usuarios/${uid}`, this.cabeceras);
  }

  bloquearUsuario(idUsuario: string, idDenunciado: string): Observable<Object>{
    return this.http.put(`${environment.base_url}/usuarios/bloquear/${idUsuario}/${idDenunciado}?token=${this.token}`, this.cabeceras);
  }

  seguirUsuario(id: string, usuario: string): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/${id}/${usuario}?token=${this.token}`, this.cabeceras);;
  }

  login( formData: loginForm ) {
    return this.http.post(`${environment.base_url}/auth`, formData)
      .pipe(
        tap( (res: any) => {
          console.log(res);
          localStorage.setItem('token', res['token']);
          const {uid, rol} = res;
          this.usuario = new Usuario(uid, rol);
          //localStorage.setItem('rutascargadas', 'false');
          localStorage.setItem('rol', rol);
        })
      );
  }

  loginGoogle( tokenGoogle: any ) {
    return this.http.post(`${environment.base_url}/auth/google`, {token: tokenGoogle})
      .pipe(
        tap( (res: any) => {
          localStorage.setItem('token', res['token']);
          const {uid, rol} = res;
          this.usuario = new Usuario(uid, rol);
          localStorage.setItem('rol', rol);
        })
      );
  }

  logout(): void {
    this.limpiarLocalStorage();
    this.router.navigateByUrl('/login');
  }

  registrarUsuario( formData: registroForm) {
    return this.http.post(`${environment.base_url}/usuarios`, formData);
  }

  enviarEmail( formData: Data) {
    return this.http.post(`${environment.base_url}/auth/enviar/email`, formData, this.cabeceras);
  }

  activarUsuario( token: string){
    let body = "";
    return this.http.put(`${environment.base_url}/auth/activateUser/${token}`, body);
  }

  reEnviarEmail( email: string) {
    let body = "";
    return this.http.post(`${environment.base_url}/auth/reenviar/${email}`, body);
  }

  subirImagen(uid:string, fd: FormData, token?: any): Observable<Object>{
    if(!token){
      token = "";
      return this.http.put(`${environment.base_url}/usuarios/subir/imagen/perfil/${uid}`, fd, this.cabeceras);
    }else{
      return this.http.put(`${environment.base_url}/usuarios/subir/imagen/perfil/${uid}?token=${token}`, fd);
    }
  }

  borrarFoto(uid: string){
    return this.http.delete(`${environment.base_url}/usuarios/imagen/${uid}`, this.cabeceras);
  }

  getEdad(uid: string){
    return this.http.get(`${environment.base_url}/usuarios/edad/${uid}`, this.cabeceras);
  }

  restablecerPass(uid: string, formData: Data){
    return this.http.put(`${environment.base_url}/auth/password/${uid}`, formData, this.cabeceras);
  }

  resetPass(formData: Data){
    return this.http.put(`${environment.base_url}/auth/changePassword`, formData, this.cabeceras);
  }

  validar(correcto: boolean, incorrecto: boolean): Observable<boolean> {
    if (this.token === '') {
      this.limpiarLocalStorage();
      return of(incorrecto);
    }
    return this.http.get(`http://localhost:3000/api/auth/token`, this.cabeceras)
      .pipe(
        tap( (res: any) => {
          // extaemos los datos que nos ha devuelto y los guardamos en el usurio y en localstorage
          const { uid, rol, token} = res;
          localStorage.setItem('token', token);
          this.usuario = new Usuario(uid, rol);
        }),
        map ( res => {
          return correcto;
        }),
        catchError ( err => {
          this.limpiarLocalStorage();
          return of(incorrecto);
        })
      );
  }

  validarToken(): Observable<boolean> {
    return this.validar(true, false);
  }

  validarNoToken(): Observable<boolean> {
    return this.validar(false, true);
  }

  limpiarLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    localStorage.removeItem('before');
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

  get uid(): string {
    return this.usuario.uid;
  }

  get rol(): string {
    return this.usuario.rol;
  }
}

