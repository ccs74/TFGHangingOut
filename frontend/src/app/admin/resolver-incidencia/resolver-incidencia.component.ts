import { Component, OnInit } from '@angular/core';
import { IncidenciaService } from 'src/app/services/incidencia.service';
import { Incidencia } from 'src/app/models/incidencia.model';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resolver-incidencia',
  templateUrl: './resolver-incidencia.component.html',
  styleUrls: ['./resolver-incidencia.component.css']
})
export class ResolverIncidenciaComponent implements OnInit {

  public idIncidencia: any;
  public incidencia: Incidencia[] = [];
  public nombre: string = "";

  public idUsuario: any;

  public bloqueado: boolean = false;
  public before: any;

  constructor(private incidenciaService: IncidenciaService,
              private usuarioService: UsuarioService,
              private router: Router,
              private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.idIncidencia = this.route.snapshot.params['uid'];
    this.cargarUsuarioAdmin();
    this.cargarIncidencia();
    this.before = localStorage.getItem('before');
  }

  cargarUsuarioAdmin(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.idUsuario = res['existeUsuario'].uid;
      console.log(this.idUsuario);
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarIncidencia(){
    this.incidenciaService.cargarIncidencias(this.idIncidencia)
    .subscribe((res: any) => {
      console.log(res);
      this.incidencia = [];
      this.incidencia.push(res['incidencias']);
      this.convertirFecha(this.incidencia[0].fecha);
      this.convertirMotivo(this.incidencia[0].motivo);
      this.cargarUsuario(this.incidencia[0].denunciado, 1);
      this.cargarUsuario(this.incidencia[0].denunciante, 2);
      console.log(this.incidencia[0]);
    }, (err: any) => {
      console.log(err);
    });
  }

  denegar(){
    this.incidenciaService.resolver(this.idIncidencia, "denegar")
    .subscribe((res: any) => {
      console.log(res);
      Swal.fire({icon: 'success', title: 'Incidencia Resulta!', text: 'Solución: Denegada'}).then((result)=>{
        if(result.value){
          this.router.navigateByUrl("/admin/incidencias");
        }
      });
    }, (err: any) => {
      console.log(err);
    });
  }

  bloquear(){
    this.incidenciaService.resolver(this.idIncidencia, "bloquear")
    .subscribe((res: any) => {
      console.log(res);
      Swal.fire({icon: 'success', title: 'Incidencia Resulta!', text: 'Solución: Bloqueado el usuario denunciado'}).then((result)=>{
        if(result.value){
          this.router.navigateByUrl(`/admin/incidencias`);
        }
      });
    }, (err: any) => {
      console.log(err);
    });
    // this.usuarioService.bloquearUsuario(this.idUsuario, this.incidencia[0].denunciado)
    // .subscribe((res: any) => {
    //   console.log(res);
    //   if(this.bloqueado){
    //     this.bloqueado = false;
    //     Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario desbloqueado'});
    //   }else{
    //     this.bloqueado = true;
    //     Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario bloqueado'});
    //   }
    // }, (err: any) => {
    //   console.log(err);
    //   const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
    //   Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    // });
  }

  cargarUsuario(id: string, user: number){
    this.usuarioService.cargarUsuario(id)
    .subscribe((res: any) => {
      switch(user){
        case 1:
          this.incidencia[0].emailDenunciado = res['existeUsuario'].email;
          this.nombre = res['existeUsuario'].nombre;
          this.bloqueado = res['existeUsuario'].bloqueado;
          break;
        case 2:
          this.incidencia[0].emailDenunciante = res['existeUsuario'].email;
          break;
      }
    }, (err: any) =>  {
      console.log(err);
    });
  }

  convertirFecha(fecha: Date){
    let date = new Date(fecha);
    let d, m, dia, mes, anyo;
    d = date.getDate();
    if(d < 10){
      dia = "0" + d.toString();
    }else{
      dia = d.toString();
    }
    m = date.getMonth() + 1;
    if(m < 10){
      mes = "0" + m.toString();
    }else{
      mes = m.toString();
    }
    anyo = date.getFullYear().toString();
    let cadena = dia + "-" + mes + "-" + anyo;
    this.incidencia[0].fecha2 = cadena;
  }

  convertirMotivo(motivo: string){
    switch(motivo){
      case "estafa":
        this.incidencia[0].motivo2 = "Estafa";
        break;
      case "acoso":
        this.incidencia[0].motivo2 = "Acoso";
        break;
      case "contenidoInapropiado":
        this.incidencia[0].motivo2 = "Contenido Inapropiado";
        break;
      case "fotoInapropiada":
        this.incidencia[0].motivo2 = "Foto de Perfil Inapropiada";
        break;
    }
  }

  logout(): void {
    this.usuarioService.logout();
  }
}
