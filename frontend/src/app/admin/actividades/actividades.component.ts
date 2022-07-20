import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, Validators } from '@angular/forms';
import { Actividad } from 'src/app/models/actividad.model';
import { ActividadesService } from '../../services/actividades.service';
import { UsuarioService } from 'src/app/services/usuario.service';
@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent implements OnInit {

  public listaActividades: Actividad[] = [];
  public mostrarBuscador: boolean = false;
  public listaFotos: any[] = [];

  constructor(private fb: FormBuilder,
              private actividadService: ActividadesService,
              private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarActividades("");
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

  cargarActividades(textoBuscar: string){
    this.actividadService.cargarActividades(textoBuscar)
    .subscribe( (res: any) => {
      this.listaActividades = res['actividades'];
      for(let i = 0; i < this.listaActividades.length; i++){
        this.listaActividades[i].foto = this.listaActividades[i].fotos[0];
        this.listaActividades[i].fecha2 = this.convertirFecha(this.listaActividades[i].fecha);
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
      }
      this.listaActividades.sort((a, b) => {
        return <any>new Date(b.fecha) - <any>new Date(a.fecha);
      });
      console.log(this.listaActividades);
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
    });
  }

  activarBuscador(){
    this.mostrarBuscador = true;
  }

  borrarActividad(uid: string, nombre?: string){
    Swal.fire({
      title: 'Eliminar Actividad',
      text: `Al eliminar la actividad ${nombre} se perderán todos los datos asociados, ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if(result.value){
        this.actividadService.borrarActividad(uid)
        .subscribe( resp => {
          this.cargarActividades("");
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelta a intentarlo',});
        })
      }
    });
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
