import { Component, OnInit } from '@angular/core';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';
import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Categoria } from 'src/app/models/categoria.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-resultados-actividades',
  templateUrl: './resultados-actividades.component.html',
  styleUrls: ['./resultados-actividades.component.css']
})
export class ResultadosActividadesComponent implements OnInit {

  public listaActividades: Actividad[] = [];
  public idUsuario: any;
  public favoritas: any[] = [];
  public asistidas: any[] = [];

  public bloqueados: Usuario[] = [];
  public listaCategorias: Categoria[] = [];
  public listaFecha = [
    {nombre: "Hoy", clase: "categoria", uid: 1, marcado: false},
    {nombre: "Mañana", clase: "categoria", uid: 2, marcado: false},
    {nombre: "Fin de Semana", clase: "categoria", uid: 3, marcado: false}
  ];

  public listaVacia: boolean = false;

  public filtrosForm = this.fb.group({
    texto: [''],
    lugar: [''],
    intereses: [''],
    fecha: [''],
    min: [''],
    max: [''],
    popularidad: ['']
  });

  public mostrarFiltros: boolean = false;

  constructor(private actividadService: ActividadesService,
              private usuarioService: UsuarioService,
              private categoriaService: CategoriasService,
              private fb: FormBuilder,
              ) { }

  ngOnInit(): void {
    this.cargarUsuario();
    this.buscarActividades();
    this.cargarCategorias();
    this.filtrosForm.get('popularidad')?.setValue(false);

  }

  cambiarPag(){
    localStorage.setItem('before', `/resultados-actividades`);
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
      this.bloqueados = res['existeUsuario'].bloqueados;
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  actualizarActividades(){
    for(let i = 0; i < this.listaActividades.length; i++){
      this.listaActividades[i].foto = this.listaActividades[i].fotos[0];
      this.listaActividades[i].fechaValida = this.validarFecha(this.listaActividades[i].fecha);
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
    this.listaActividades.sort((a, b) => {
      return <any>new Date(b.fecha) - <any>new Date(a.fecha);
    });
  }

  buscarActividades(){
    console.log(this.filtrosForm.value);
    let texto, lugar, intereses, min, max, fecha, popularidad;

    if(this.filtrosForm.get('texto')?.value){
      texto = this.filtrosForm.get('texto')?.value;
    }else{
      texto = "";
    }
    if(this.filtrosForm.get('lugar')?.value){
      lugar = this.filtrosForm.get('lugar')?.value;
    } else{
      lugar = "";
    }
    if(this.filtrosForm.get('intereses')?.value){
      intereses = this.filtrosForm.get('intereses')?.value;
    }else{
      intereses = [];
    }
    if(this.filtrosForm.get('min')?.value){
      min = this.filtrosForm.get('min')?.value;
    } else{
      min = "";
    }
    if(this.filtrosForm.get('max')?.value){
      max = this.filtrosForm.get('max')?.value;
    }else{
      max = "";
    }
    let domingo
    if(this.filtrosForm.get('fecha')?.value){
      if(this.filtrosForm.get('fecha')?.value == "finde"){
        let viernes = new Date();
        while(viernes.getDay() !== 4){
          viernes = new Date(viernes.getDate() + 1);
        }
        domingo = new Date(viernes);
        domingo.setDate(domingo.getDate() + 2);
        fecha = viernes;
      }else{
        fecha = this.filtrosForm.get('fecha')?.value;
      }
    }else{
      fecha = "";
    }
    popularidad = this.filtrosForm.get('popularidad')?.value;
    this.actividadService.cargarActividades(texto, lugar, intereses, min, max, fecha, popularidad, domingo)
    .subscribe( (res: any) => {
      this.mostrarFiltros = false;
      let actividades = res['actividades'];
      this.listaActividades = [];
      for(let i = 0; i < actividades.length; i++){
        let add = true;
        for(let j = 0; j < this.bloqueados.length;  j++){
          if(actividades[i].organizador == this.bloqueados[j]){
            add = false;
          }
        }

        if(add && this.validarFecha(actividades[i].fecha)){
          console.log(actividades[i].titulo);
          this.listaActividades.push(actividades[i]);
        }
      }
      if(this.listaActividades.length == 0){
        this.listaVacia = true;
      }else{
        this.listaVacia = false;
      }
      this.actualizarActividades();
      console.log(res);
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarCategorias(){
    this.categoriaService.cargarCategorias()
    .subscribe((res: any) => {
      this.listaCategorias = res['categorias'];
      for(let i = 0; i < this.listaCategorias.length; i++){
        this.listaCategorias[i].marcado = false;
        this.listaCategorias[i].clase = "categoria";
      }
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      console.log(err);
    });
  }

  marcarFavorito(idActividad: string, fav: boolean){
    this.actividadService.marcarFavorito(this.idUsuario, idActividad, fav)
    .subscribe( ( res: any) => {
      console.log(res);
      this.favoritas = res['existeUsuario'].actividades_favoritas;
      this.actualizarActividades();
    }, ( err: any) => {
      console.log(err);
    });
  }

  marcarAsistencia(idActividad: string, asis: boolean){
    this.actividadService.marcarAsistencia(this.idUsuario, idActividad, asis)
    .subscribe( ( res: any) => {
      console.log(res);
      this.asistidas = res['existeUsuario'].actividades_asistidas;
      this.actualizarActividades();
    }, (err: any) => {
      console.log(err);
    });
  }

  updateTexto(texto: string){
    this.filtrosForm.get('texto')?.setValue(texto);
    if(this.mostrarFiltros == false){
      this.buscarActividades();
    }
  }

  oncheckChanged(e: any, id: any){
    for(let i = 0; i < this.listaFecha.length; i++){
      if(this.listaFecha[i].uid === id){
        if(!this.listaFecha[i].marcado){
          this.listaFecha[i].marcado = true;
          this.listaFecha[i].clase = "categoria-fecha"
        }
      }else{
        this.listaFecha[i].marcado = false;
        this.listaFecha[i].clase = "categoria";
      }
    }
    let fecha;
    switch(id){
      case 1:
        fecha = new Date();
        break;
      case 2:
        fecha = new Date();
        fecha.setDate(fecha.getDate() + 1);
        break;
      case 3:
        fecha = "finde";
        break;
    }
    this.filtrosForm.get('fecha')?.setValue(fecha);
  }

  checkPopularidad(e: any){
    if(this.filtrosForm.get('popularidad')?.value == false){
      this.filtrosForm.get('popularidad')?.setValue(true);
    }else{
      this.filtrosForm.get('popularidad')?.setValue(false);
    }
  }

  onCheckboxChange(e:any, uid: any) {
    for(let i = 0; i < this.listaCategorias.length; i++){
      if(this.listaCategorias[i].uid === uid){
        if(!this.listaCategorias[i].marcado){
          this.listaCategorias[i].marcado = true;
          this.listaCategorias[i].clase = "categoria-selected";
        }else{
          this.listaCategorias[i].marcado = false;
          this.listaCategorias[i].clase = "categoria";
        }
      }
    }
    let intereses = [];
    for(let i = 0; i < this.listaCategorias.length; i++){
      if(this.listaCategorias[i].marcado == true){
        intereses.push(this.listaCategorias[i].uid);
      }
    }
    this.filtrosForm.get('intereses')?.setValue(intereses);
  }

  activarFiltros(){
    if(this.mostrarFiltros == false){
      this.mostrarFiltros = true;
    }else{
      this.mostrarFiltros = false;
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
