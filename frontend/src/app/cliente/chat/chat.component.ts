import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActividadesService } from '../../services/actividades.service';
import { Actividad } from '../../models/actividad.model';
import { Usuario } from '../../models/usuario.model';
import { Mensaje } from '../../models/mensaje.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  public mensajeForm = this.fb.group({
    emisor: [''],
    receptor: [''],
    texto: [''],
    chat: [''],
    fecha: ['']
  });

  public chatForm = this.fb.group({
    usuario1: [''],
    usuario2: [''],
    actividad: ['']
  });

  public nuevo: boolean = false;
  public chatId: any;
  public chat: any;

  public someId: any;

  public idUsuario: any;
  public idReceptor: any;
  public receptor: any;

  public actividad: any;
  public actividadId: any;

  public fecha: any;

  public texto: string = "";

  public listaMensajes: Mensaje[] = [];
  public listaBloqueados: any[] = [];
  public bloqueado: boolean = false;

  constructor(private chatService: ChatService,
              private usuarioService: UsuarioService,
              private actividadService: ActividadesService,
              private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              ) { }

  ngOnInit(): void {
    this.someId = this.route.snapshot.params['uid'];
    this.cargarUsuario();
    this.queTengo();
  }

  queTengo(){
    let idChat: boolean = false;
    this.chatService.chatOActividad(this.someId)
    .subscribe((res: any) => {
      //Si tengo el id del chat
      if(res['msg'] == "Es un chat"){
        this.chatId = this.someId;
        this.chatService.cargarChats(this.chatId)
        .subscribe((chat: any) => {
          this.chat = chat['chats'];
          if(this.chat.usuario1 == this.idUsuario){
            this.idReceptor = this.chat.usuario2;
          }else{
            this.idReceptor = this.chat.usuario1;
          }
          this.cargarUsuario(this.idReceptor);
          console.log(this.chat);
          this.actividadService.cargarActividad(this.chat.actividad)
          .subscribe((act: any) => {
            console.log(act);
            this.actividad = act['existeActividad'];
            this.fecha = this.convertirFecha(this.actividad.fecha);
            this.cargarMensajes();
          }, (err: any) => {
            console.log(err);
          });
        }, (err: any) => {
          console.log(err);
        });
      }else{
        //Si tengo el id de la actividad
        this.actividadId = this.someId;
        this.actividadService.cargarActividad(this.actividadId)
        .subscribe((act: any) => {
          console.log(act);
          this.actividad = act['existeActividad'];
          this.idReceptor = this.actividad.organizador;
          this.cargarUsuario(this.idReceptor);
          this.fecha = this.convertirFecha(this.actividad.fecha);
          this.chatService.obtenerChat(this.idUsuario, this.actividad.organizador, this.actividadId)
          .subscribe((chat: any) => {
            console.log(chat);
            if(chat['chat'].uid !== undefined){
              console.log(chat['chat'].uid)
              this.chatId = chat['chat'].uid;
              this.cargarMensajes();
            }else{
              this.chatId = 'nuevo';
              this.nuevo = true;
              console.log("es nuevo");
            }
          }, (err: any) => {
            console.log(err);
          });
        }, (err: any) => {
          console.log(err);
        });
      }
    }, (err: any) => {
      console.log(err);
    });
    console.log(this.nuevo);
  }

  enviarMensaje(text: string){
    if(text!= ""){
      this.texto = text;
      if(this.nuevo){
        this.chatForm.get('usuario1')?.setValue(this.idUsuario);
        this.chatForm.get('usuario2')?.setValue(this.idReceptor);
        this.chatForm.get('actividad')?.setValue(this.actividadId);
        this.chatService.crearChat(this.chatForm.value)
        .subscribe( ( res: any) => {
          this.chatId = res['chat'].uid;
          this.mensajeForm.get('emisor')?.setValue(this.idUsuario);
          this.mensajeForm.get('receptor')?.setValue(this.idReceptor);
          this.mensajeForm.get('texto')?.setValue(this.texto);
          this.mensajeForm.get('chat')?.setValue(this.chatId);
          let fecha = new Date();
          this.mensajeForm.get('fecha')?.setValue(fecha);
          this.chatService.enviarMensaje(this.chatId, this.mensajeForm.value)
          .subscribe((res: any) => {
            console.log(res);
            this.nuevo = false;
            // this.cargarChat();
          }, (err: any) => {
            console.log(err);
          });
        }, (err: any) => {
          console.log(err);
        });

      }else{
        this.mensajeForm.get('emisor')?.setValue(this.idUsuario);
        this.mensajeForm.get('receptor')?.setValue(this.idReceptor);
        this.mensajeForm.get('texto')?.setValue(this.texto);
        this.mensajeForm.get('chat')?.setValue(this.chatId);
        let fecha = new Date();
        this.mensajeForm.get('fecha')?.setValue(fecha);
        this.chatService.enviarMensaje(this.chatId, this.mensajeForm.value)
        .subscribe((res: any) => {
          console.log(res);
          this.cargarMensajes();
        }, (err: any) => {
          console.log(err);
        });
      }
    }
  }

  cargarUsuario(idUsuario?: string){
    let id = "";
    if(idUsuario){
      id = idUsuario;
    }
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario(id, usuario)
    .subscribe((res: any) => {
      console.log(res);
      if(idUsuario){
        this.receptor = res['existeUsuario'];
        console.log(this.receptor);
        for(let i = 0; i < this.listaBloqueados.length; i++){
          if(this.listaBloqueados[i] == this.receptor.uid){
            this.bloqueado = true;
          }
        }
        console.log(this.bloqueado);
      }else{
        this.idUsuario = res['existeUsuario'].uid;
        this.listaBloqueados = res['existeUsuario'].bloqueados;
        console.log(this.listaBloqueados);
      }
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  cargarMensajes(){
    this.chatService.cargarMensajes(this.chatId, this.idUsuario)
    .subscribe( ( res: any) => {
      console.log(res);
      this.listaMensajes = res['mensajes'];
      for(let i = 0; i < this.listaMensajes.length; i++){
        console.log(this.idUsuario);
        this.listaMensajes[i].hora = this.cargarHora(this.listaMensajes[i].fecha);
        if(this.listaMensajes[i].emisor == this.idUsuario){
          this.listaMensajes[i].clase = "enviado";
        }else{
          this.listaMensajes[i].clase = "recibido";
        }
      }
      let ultFecha = new Date();
      let fechaAnterior = "";
      for(let i = 0; i < this.listaMensajes.length; i++){
        if(i == 0 || ultFecha < this.listaMensajes[i].fecha){
          ultFecha = this.listaMensajes[i].fecha;
          if(i == 0){
            let mesg: Mensaje = {
              uid: "",
              texto: this.convertirFecha2(ultFecha),
              emisor: "",
              receptor: "",
              chat: this.listaMensajes[i].uid,
              fecha: this.listaMensajes[i].fecha,
              clase: "fechaChat2"
            }
            if(this.convertirFecha2(ultFecha) !== fechaAnterior){
              this.listaMensajes.splice(i, 0, mesg);
            }
          }else{
            let mesg: Mensaje = {
              uid: "",
              texto: this.convertirFecha2(ultFecha),
              emisor: "",
              receptor: "",
              chat: this.listaMensajes[i].uid,
              fecha: this.listaMensajes[i].fecha,
              clase: "fechaChat"
            }
            if(this.convertirFecha2(ultFecha) !== fechaAnterior){
              this.listaMensajes.splice(i, 0, mesg);
            }
          }
          fechaAnterior = this.convertirFecha2(ultFecha);
        }
      }
      console.log(this.listaMensajes);
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarHora(date: Date){
    let cadena = "";
    let fecha = new Date(date);
    let hora, min = "";
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

    cadena = hora + ":" + min;
    return cadena;
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

  convertirFecha2(date: Date){
    let cadena = "";
    let fecha = new Date(date);
    let dia, num, mes = "";
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
    cadena = dia + ", " + num + " " + mes;
    return cadena;
  }

  setBefore(){
    localStorage.setItem('before', `/chats/${this.someId}`);
  }
}
