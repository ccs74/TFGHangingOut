import { Component, OnInit } from '@angular/core';
import { Chat } from 'src/app/models/chat.model';
import { ChatService } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActividadesService } from 'src/app/services/actividades.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {

  public idUsuario: any;
  public listaChats: Chat[] = [];
  public listaVacia: boolean = false;

  constructor(private chatService: ChatService,
              private usuarioService: UsuarioService,
              private actividadService: ActividadesService
              ) { }

  ngOnInit(): void {
    this.cargarUsuario();

  }

  cargarUsuario(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.idUsuario = res['existeUsuario'].uid;
      this.cargarChats();
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }
  cargarChats(){
    this.chatService.cargarChats(this.idUsuario)
    .subscribe((res: any) => {
      console.log(res);
      this.listaChats = res['chats'];
      this.listaChats = this.listaChats.sort((n1,n2) => {
        if (n1.fecha_ultimoMensaje < n2.fecha_ultimoMensaje) {
            return 1;
        }

        if (n1.fecha_ultimoMensaje > n2.fecha_ultimoMensaje) {
            return -1;
        }
        return 0;
      });
      for(let i = 0; i < this.listaChats.length; i++){
        let receptor = "";
        if(this.listaChats[i].usuario1 == this.idUsuario){
          receptor = this.listaChats[i].usuario2;
        }else{
          receptor = this.listaChats[i].usuario1;
        }
        this.usuarioService.cargarUsuario(receptor)
        .subscribe((res: any) => {
          console.log(res['existeUsuario']);
          let nombreRecep = res['existeUsuario'].nombre + " " + res['existeUsuario'].apellidos;
          if(nombreRecep.length < 25){
            nombreRecep = nombreRecep.substring(0, 24);
          }
          this.listaChats[i].receptor = nombreRecep;
          this.listaChats[i].fotoUsuario = res['existeUsuario'].foto;
        }, (err: any) => {
          console.log(err);
        });
        this.actividadService.cargarActividad(this.listaChats[i].actividad)
        .subscribe((res: any) => {
          let tit = res['existeActividad'].titulo;
          if(tit.length < 25){
            tit = tit.substring(0, 24);
          }
          this.listaChats[i].titulo = tit;
          this.listaChats[i].fecha = this.convertirFecha(res['existeActividad'].fecha);
          this.listaChats[i].fotoActividad = res['existeActividad'].fotos[0];
        }, (err: any) => {
          console.log(err);
        });
        this.chatService.calcularDias(this.listaChats[i].fecha_ultimoMensaje)
        .subscribe((res: any) => {
          this.listaChats[i].dias = res.resultado;
        }, (err: any) => {
          console.log(err);
        });
      }
      if(this.listaChats.length == 0){
        this.listaVacia = true;
      }else{
        this.listaVacia = false;
      }
    }, (err: any) => {
      console.log(err);
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
}
