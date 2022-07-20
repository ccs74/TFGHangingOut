import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProvinciaService } from 'src/app/services/provincias.service';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';

@Component({
  selector: 'app-ver-usuario',
  templateUrl: './ver-usuario.component.html',
  styleUrls: ['./ver-usuario.component.css']
})
export class VerUsuarioComponent implements OnInit {

  public idUsuario: any;
  public idUsuarioLog: any;
  public usuario: any;
  public edad: any;
  public provincia: any;
  public bloqueado: boolean = false;
  public siguiendo: boolean = false;
  public anterior: any;
  public actividadesCreadas: number = 0;
  public mostrarActividades: boolean = false;
  public listaActividades: Actividad[] = [];
  public favoritas: any[] = [];
  public asistidas: any[] = [];
  public numActividades: number = 0;

  constructor(private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private router: Router,
              private route: ActivatedRoute,
              private actividadesService: ActividadesService) { }

  ngOnInit(): void {
    this.idUsuario = this.route.snapshot.params['uid'];
    this.cargarUsuario();
    this.cargarUsuarioLogueado();
    this.anterior = localStorage.getItem('before');
    this.cargarActividades();
  }

  cargarUsuario(){
    if(this.idUsuario !== ""){
      this.usuarioService.cargarUsuario(this.idUsuario)
      .subscribe( ( res: any) => {
        this.usuario = res['existeUsuario'];
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


  cargarUsuarioLogueado(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      this.idUsuarioLog = res['existeUsuario'].uid;
      let bloqueados = res['existeUsuario'].bloqueados;
      for(let i = 0; i < bloqueados.length; i++){
        if(bloqueados[i] == this.idUsuario){
          this.bloqueado = true;
        }
      }
      let seguidos = res['existeUsuario'].siguiendo;
      for(let i = 0; i < seguidos.length; i++){
        if(seguidos[i] == this.idUsuario){
          this.siguiendo = true;
        }
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  bloquear(){
    this.usuarioService.bloquearUsuario(this.idUsuarioLog, this.idUsuario)
    .subscribe((res: any) => {
      if(this.bloqueado == true){
        this.bloqueado = false;
      }else{
        this.bloqueado = true;
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  seguir(){
    if(this.idUsuario && this.idUsuarioLog){
      this.usuarioService.seguirUsuario(this.idUsuarioLog, this.idUsuario)
      .subscribe((res: any) => {
        if(this.siguiendo){
          this.siguiendo = false;
        }else{
          this.siguiendo = true;
        }
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  marcarFavorito(idActividad: string, fav: boolean){
    this.actividadesService.marcarFavorito(this.idUsuario, idActividad, fav)
    .subscribe( ( res: any) => {
      this.favoritas = res['existeUsuario'].actividades_favoritas;
      this.actualizarActividades();
    }, ( err: any) => {
      console.log(err);
    });
  }

  marcarAsistencia(idActividad: string, asis: boolean){
    this.actividadesService.marcarAsistencia(this.idUsuario, idActividad, asis)
    .subscribe( ( res: any) => {
      this.asistidas = res['existeUsuario'].actividades_asistidas;
      this.actualizarActividades();
    }, (err: any) => {
      console.log(err);
    });
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
    }
    for(let i = 0; i < this.listaActividades.length; i++){
      for(let j = 0; j < this.favoritas.length; j++){
        if(this.listaActividades[i].uid == this.favoritas[j]){
          this.listaActividades[i].favorito = true;
        }
      }
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
    this.numActividades = this.listaActividades.length;
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
}
