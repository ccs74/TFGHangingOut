import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProvinciaService } from 'src/app/services/provincias.service';
import { Actividad } from 'src/app/models/actividad.model';
import { ActividadesService } from 'src/app/services/actividades.service';
import { IncidenciaService } from 'src/app/services/incidencia.service';
import Swal from 'sweetalert2';
import { Incidencia } from 'src/app/models/incidencia.model';

@Component({
  selector: 'app-ver-usuario',
  templateUrl: './ver-usuario.component.html',
  styleUrls: ['./ver-usuario.component.css']
})
export class VerUsuarioComponent implements OnInit {

  public idUsuario: any;
  public usuario: any;
  public edad: any;
  public nacimiento: any;
  public provincia: any;
  public mostrarActividades: boolean = false;
  public listaActividades: Actividad[] = [];
  public numActividades: number = 0;
  public numIncidencias: number = 0;
  public mostrarIncidencias: boolean = false;
  public listaIncidencias: Incidencia[] = [];

  constructor(private usuarioService: UsuarioService,
              private route: ActivatedRoute,
              private provinciaService: ProvinciaService,
              private actividadesService: ActividadesService,
              private incidenciaService: IncidenciaService) { }

  ngOnInit(): void {
    this.idUsuario = this.route.snapshot.params['uid'];
    this.cargarUsuario();
    this.cargarActividades();
    this.cargarIncidencias();
  }

  cargarUsuario(){
    if(this.idUsuario !== ""){
      this.usuarioService.cargarUsuario(this.idUsuario)
      .subscribe( ( res: any) => {
        this.usuario = res['existeUsuario'];
        console.log(this.usuario);
        this.calcularNacimiento(this.usuario.fecha_nacimiento);
        this.usuarioService.getEdad(this.idUsuario)
        .subscribe((res: any) =>  {
          this.edad = res.result;
        }, (err: any) => {
          console.log(err);
        });
        this.provinciaService.cargarProvincias()
        .subscribe((res: any) => {
          let provs = res['provincias'];
          for(let i = 0; i < provs.length; i++){
            if(provs[i].uid == this.usuario.provincia){
              this.provincia = provs[i].nombre;
            }
          }
        }, (err: any) => {
          console.log(err);
        });
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  mostrarActividadesCreadas(mostrar: boolean){
    this.mostrarActividades = mostrar;
  }

  mostrarIncidenciasUsuario(mostrar: boolean){
    this.mostrarIncidencias = mostrar;
  }

  cargarActividades(){
    this.actividadesService.cargarActividades()
    .subscribe((res: any) => {
      let actividades = res['actividades'];
      for(let i = 0; i < actividades.length; i++){
        if(actividades[i].organizador == this.idUsuario){
          this.listaActividades.push(actividades[i]);
        }
      }
      this.actualizarActividades();
    }, (err: any) => {
      console.log(err);
    });
  }

  calcularNacimiento(date: Date){
    let dia, mes, anyo;
    let fecha = new Date(date);
    dia = fecha.getDate();
    mes = fecha.getMonth() + 1;
    anyo = fecha.getFullYear();
    this.nacimiento = dia + "/" + mes + "/" + anyo;
  }

  actualizarActividades(){
    for(let i = 0; i < this.listaActividades.length; i++){
      this.listaActividades[i].foto = this.listaActividades[i].fotos[0];
      this.listaActividades[i].fechaValida = this.validarFecha(this.listaActividades[i].fecha);
      console.log(this.listaActividades[i].fechaValida);
      this.listaActividades[i].fecha2 = this.convertirFecha(this.listaActividades[i].fecha);
      this.listaActividades[i].favorito = false;
      this.listaActividades[i].asistir = false;
      if(this.listaActividades[i].requisitos.length > 75){
        this.listaActividades[i].requisitos = this.listaActividades[i].requisitos.substring(0, 74) + "...";
      }
      if(this.listaActividades[i].poblacion.length > 30){
        this.listaActividades[i].poblacion = this.listaActividades[i].poblacion.substring(0, 29) + "...";
      }
      if(this.listaActividades[i].titulo.length > 22){
        this.listaActividades[i].titulo = this.listaActividades[i].titulo.substring(0, 21) + "...";
      }
      if(this.listaActividades[i].descripcion.length > 120){
        this.listaActividades[i].descripcion = this.listaActividades[i].descripcion.substring(0, 119) + "...";
      }
      if(this.listaActividades[i].organizador == this.idUsuario){
        this.listaActividades[i].esCreador = true;
      }else{
        this.listaActividades[i].esCreador = false;
      }
      if(this.listaActividades[i].num_participantes == this.listaActividades[i].max_participantes){
        this.listaActividades[i].completa = true;
      }else{
        this.listaActividades[i].completa = false;
      }
    }
    this.numActividades = this.listaActividades.length;
  }

  cargarIncidencias(){
    this.incidenciaService.cargarIncidencias(this.idUsuario)
    .subscribe((res: any) => {
      this.listaIncidencias = res['incidencias'];
      this.numIncidencias = this.listaIncidencias.length;
      console.log(res);
      for(let i = 0; i < this.listaIncidencias.length; i++){
        this.convertirFecha2(this.listaIncidencias[i].fecha, i);
        this.convertirMotivo(this.listaIncidencias[i].motivo, i);
        this.cargarUsuario2(this.listaIncidencias[i].denunciado, i, 1);
        this.cargarUsuario2(this.listaIncidencias[i].denunciante, i, 2);
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarUsuario2(id: string, pos: number, user: number){
    this.usuarioService.cargarUsuario(id)
    .subscribe((res: any) => {
      switch(user){
        case 1:
          this.listaIncidencias[pos].emailDenunciado = res['existeUsuario'].email;
          break;
        case 2:
          this.listaIncidencias[pos].emailDenunciante = res['existeUsuario'].email;
          break;
      }
    }, (err: any) =>  {
      console.log(err);
    });
  }

  convertirFecha2(fecha: Date, pos: number){
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
    this.listaIncidencias[pos].fecha2 = cadena;
  }

  convertirMotivo(motivo: string, pos: number){
    switch(motivo){
      case "estafa":
        this.listaIncidencias[pos].motivo2 = "Estafa";
        break;
      case "acoso":
        this.listaIncidencias[pos].motivo2 = "Acoso";
        break;
      case "contenidoInapropiado":
        this.listaIncidencias[pos].motivo2 = "Contenido Inapropiado";
        break;
    }
  }


  validarFecha(fecha: any){
    let valida = true;
    let hoy = new Date();
    let f = new Date(fecha);
    if(f.getFullYear() < hoy.getFullYear()){
      valida = false;
    }else if(f.getFullYear() == hoy.getFullYear()){
      if(f.getMonth() < hoy.getMonth()){
        valida = false;
      }else if(f.getMonth() == hoy.getMonth()){
        if(f.getDate() < hoy.getDate()){
          valida = false;
        }else if(f.getDate() == hoy.getDate()){
          if(f.getHours() < hoy.getHours()){
            valida = false;
          }else if(f.getHours() == hoy.getHours()){
            if(f.getMinutes() <= hoy.getMinutes()){
              valida = false;
            }
          }
        }
      }
    }
    return valida;
  }

  desbloquear(uid: any){
    this.usuarioService.bloquearUsuario(this.idUsuario, uid)
    .subscribe((res: any) => {
      console.log(res);
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario desbloqueado'});
    }, (err: any) => {
      console.log(err);
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }


  convertirFecha(date: Date){
    let cadena = "";
    let fecha = new Date(date);
    let dia, num, mes, hora, min = "";
    switch(fecha.getDay()){
      case 1: dia = "Lun"; break;
      case 2: dia = "Mar"; break;
      case 3: dia = "Mié"; break;
      case 4: dia = "Jue"; break;
      case 5: dia = "Vie"; break;
      case 6: dia = "Sáb"; break;
      case 0: dia = "Dom"; break;
    }
    num = fecha.getDate().toString();
    switch(fecha.getMonth()){
      case 0: mes = "Ene"; break;
      case 1: mes = "Feb"; break;
      case 2: mes = "Mar"; break;
      case 3: mes = "Abr"; break;
      case 4: mes = "May"; break;
      case 5: mes = "Jun"; break;
      case 6: mes = "Jul"; break;
      case 7: mes = "Ago"; break;
      case 8: mes = "Sep"; break;
      case 9: mes = "Oct"; break;
      case 10: mes = "Nov"; break;
      case 11: mes = "Dic"; break;
    }
    let sh = fecha.getHours();
    if(sh < 10){
      hora = "0" + sh.toString();
    }else{
      hora = sh.toString();
    }
    let sm = fecha.getMinutes();
    if(sm < 10){
      min = "0" + sm.toString();
    }else{
      min = sm.toString();
    }

    cadena = dia + ", " + num + " " + mes + " · " + hora + ":" + min;
    return cadena;
  }

  setBefore(){
    localStorage.setItem('before', '/admin/usuarios/ver-usuario/' + this.idUsuario);
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
