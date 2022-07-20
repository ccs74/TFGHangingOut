import { Component, OnInit } from '@angular/core';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-actividades-organizadas',
  templateUrl: './actividades-organizadas.component.html',
  styleUrls: ['./actividades-organizadas.component.css']
})
export class ActividadesOrganizadasComponent implements OnInit {

  public listaActividades: Actividad[] = [];
  public asistidas: any[] = [];
  public idUsuario: any;

  public listaVacia: boolean = false;

  constructor(private actividadService: ActividadesService,
              private usuarioService: UsuarioService,) { }

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarActividades();

  }

  cambiarPag(){
    localStorage.setItem('before', `/actividades/organizadas`);
  }
  cargarActividades(){
    this.listaActividades = [];
    this.actividadService.cargarActividades()
    .subscribe( ( res: any) => {
      console.log(res);
      for(let i = 0; i < res['actividades'].length; i++){
        console.log(res['actividades'][i].organizador);
        console.log(this.idUsuario);
        if(!this.idUsuario){
          this.cargarUsuario();
        }
        if(res['actividades'][i].organizador == this.idUsuario){
          console.log("addActividad");
          this.listaActividades.push(res['actividades'][i]);
        }
      }
      this.actualizarActividades();
    }, (err: any) => {
      console.log(err);
    });
  }

  actualizarActividades(){
    for(let i = 0; i < this.listaActividades.length; i++){
      this.listaActividades[i].foto = this.listaActividades[i].fotos[0];
      this.listaActividades[i].fecha2 = this.convertirFecha(this.listaActividades[i].fecha);
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
      //comprobar fecha
      if(this.validarFecha(this.listaActividades[i].fecha)){
        this.listaActividades[i].clase = "cardActividad";
      }else{
        this.listaActividades[i].clase = "cardActividad1";
      }
    }
    for(let i = 0; i < this.listaActividades.length; i++){
      for(let j = 0; j < this.asistidas.length; j++){
        if(this.listaActividades[i].uid == this.asistidas[j]){
          this.listaActividades[i].asistir = true;
        }
      }
      if(this.listaActividades[i].num_participantes == this.listaActividades[i].max_participantes){
        this.listaActividades[i].completa = true;
      }else{
        this.listaActividades[i].completa = false;
      }
    }
    if(this.listaActividades.length == 0){
      this.listaVacia = true;
    }else{
      this.listaVacia = false;
    }
    this.listaActividades.sort((a, b) => {
      return <any>new Date(b.fecha) - <any>new Date(a.fecha);
    });
  }

  cargarUsuario(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.asistidas = res['existeUsuario'].actividades_asistidas;
      this.idUsuario = res['existeUsuario'].uid;
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
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

}
