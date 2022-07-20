import { Component, OnInit } from '@angular/core';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/models/usuario.model';
import { ProvinciaService } from 'src/app/services/provincias.service';

@Component({
  selector: 'app-ver-actividad',
  templateUrl: './ver-actividad.component.html',
  styleUrls: ['./ver-actividad.component.css']
})
export class VerActividadComponent implements OnInit {

  public actividad: any;
  public idUsuario: any;
  public favoritas: any[] = [];
  public asistidas: any[] = [];
  public organizador: any;
  public actividadId: any;

  public mostrarParticipants: boolean = false;
  public listaParticipantes: Usuario[] = [];
  public provincia: any;
  public viable: boolean = false;

  constructor(private actividadService: ActividadesService,
              private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private router: Router,
              private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.actividadId = this.route.snapshot.params['uid'];
    this.cargarActividad();
  }

  cargarActividad(){
    if(this.actividadId !== ""){
      this.actividadService.cargarActividad(this.actividadId)
      .subscribe((res: any) => {
        console.log(res);
        this.actividad = res['existeActividad'];
        this.usuarioService.cargarUsuario(this.actividad.organizador)
        .subscribe((res: any) => {
          this.organizador = res['existeUsuario'];
          if(this.idUsuario == this.organizador.uid){
            this.actividad.esCreador = true;
          }else{
            this.actividad.esCreador = false;
          }
        }, (err:any) => {
          console.log(err);
        });
        this.provinciaService.cargarProvincias()
        .subscribe((res: any) => {
          let provs = res['provincias'];
          for(let i = 0; i < provs.length; i++){
            if(provs[i].uid == this.actividad.provincia){
              this.provincia = provs[i].nombre;
            }
          }
        }, (err: any) => {
          console.log(err);
        });
        this.actualizarActividad();
      }, (err:  any) => {
        console.log(err);
      });
    }
  }

  actualizarActividad(){
    this.actividad.foto = this.actividad.fotos[0];
    this.actividad.fecha2 = this.convertirFecha(this.actividad.fecha);
    this.actividad.favorito = false;
    this.actividad.asistir = false;
    let participantes = this.actividad.participantes;
    this.listaParticipantes = [];
    for(let i = 0; i < participantes.length; i++){
      this.usuarioService.cargarUsuario(participantes[i], "")
      .subscribe((res: any) => {
        this.listaParticipantes.push(res['existeUsuario']);
      }, (err: any) => {
        console.log(err);
      });
    }
    console.log(this.listaParticipantes);

    for(let i = 0; i < this.favoritas.length; i++){
      if(this.favoritas[i] == this.actividad.uid){
        this.actividad.favorito = true;
      }
    }
    for(let i = 0; i < this.asistidas.length; i++){
      if(this.asistidas[i] == this.actividad.uid){
        this.actividad.asistir = true;
      }
    }
    if(this.actividad.num_participantes >= this.actividad.min_participantes){
      this.viable = true;
    }else{
      this.viable = false;
    }
  }

  mostrarParticipantes(op: boolean){
    if(op == true){
      this.mostrarParticipants = true;
    }else{
      this.mostrarParticipants = false;
    }
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

  guardarPag(idUsu: string){
    let ruta = "/admin/usuarios/ver-usuario/"+idUsu;
    localStorage.setItem('before', `/admin/actividades/ver-actividad/${this.actividad.uid}`);
    this.router.navigateByUrl(ruta);
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
