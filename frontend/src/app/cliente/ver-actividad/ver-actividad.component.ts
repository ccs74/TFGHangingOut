import { Component, OnInit } from '@angular/core';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-ver-actividad',
  templateUrl: './ver-actividad.component.html',
  styleUrls: ['./ver-actividad.component.css']
})
export class VerActividadComponent implements OnInit {

  public actividadForm = this.fb.group({
    organizador: [''],
    titulo: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    requisitos: ['', Validators.required],
    fecha: ['', [ Validators.required] ],
    hora: ['', Validators.required],
    direccion: ['', [Validators.required]],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    min_participantes: ['', Validators.required ],
    max_participantes: ['', Validators.required ],
    precio: ['', Validators.required ],
    categorias: [new Array([]), Validators.required],
    participa: ['' ],
    imagenes: [''],
    fotos: ['']
  });

  public actividad: any;
  public idUsuario: any;
  public favoritas: any[] = [];
  public asistidas: any[] = [];
  public organizador: any;
  public actividadId: any;

  public mostrarParticipants: boolean = false;
  public listaParticipantes: Usuario[] = [];

  public viable: boolean = false;

  constructor(private actividadService: ActividadesService,
              private usuarioService: UsuarioService,
              private router: Router,
              private route: ActivatedRoute,
              private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.actividadId = this.route.snapshot.params['uid'];
    this.cargarUsuario();
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
        this.actualizarActividad();
      }, (err:  any) => {
        console.log(err);
      });
    }
  }

  cargarUsuario(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.favoritas = res['existeUsuario'].actividades_favoritas;
      this.asistidas = res['existeUsuario'].actividades_asistidas;
      this.idUsuario = res['existeUsuario'].uid;
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  updateActividad(){
    this.actividadForm.get('organizador')?.setValue(this.actividad.organizador);
    this.actividadForm.get('titulo')?.setValue(this.actividad.titulo);
    this.actividadForm.get('descripcion')?.setValue(this.actividad.descripcion);
    this.actividadForm.get('requisitos')?.setValue(this.actividad.requisitos);
    this.actividadForm.get('fecha')?.setValue(this.actividad.fecha);
    this.actividadForm.get('direccion')?.setValue(this.actividad.direccion);
    this.actividadForm.get('poblacion')?.setValue(this.actividad.poblacion);
    this.actividadForm.get('provincia')?.setValue(this.actividad.provincia);
    this.actividadForm.get('min_participantes')?.setValue(this.actividad.min_participantes);
    this.actividadForm.get('max_participantes')?.setValue(this.actividad.max_participantes);
    this.actividadForm.get('precio')?.setValue(this.actividad.precio);
    this.actividadForm.get('categorias')?.setValue(this.actividad.categorias);
    this.actividadForm.get('participa')?.setValue(this.actividad.participa);
    this.actividadForm.get('imagenes')?.setValue(this.actividad.imagenes);
    this.actividadForm.get('fotos')?.setValue(this.actividad.fotos);

  }

  marcarFavorito(idActividad: string, fav: boolean){
    this.actividadService.marcarFavorito(this.idUsuario, idActividad, fav)
    .subscribe( ( res: any) => {
      console.log(res);
      this.favoritas = res['existeUsuario'].actividades_favoritas;
      this.actualizarActividad();
    }, ( err: any) => {
      console.log(err);
    });
  }

  marcarAsistencia(idActividad: string, asis: boolean){
    this.actividadService.marcarAsistencia(this.idUsuario, idActividad, asis)
    .subscribe( ( res: any) => {
      console.log(res);
      this.asistidas = res['existeUsuario'].actividades_asistidas;
      this.cargarActividad();
    }, (err: any) => {
      console.log(err);
    });
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

  guardarPag(idUsu: string){
    let ruta = "/usuarios/"+idUsu;
    localStorage.setItem('before', `/actividades/ver-actividad/${this.actividad.uid}`);
    this.router.navigateByUrl(ruta);
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

}
