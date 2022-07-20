import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Actividad } from 'src/app/models/actividad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadesService } from 'src/app/services/actividades.service';
import { UsuarioService } from '../../services/usuario.service';
import { ProvinciaService } from 'src/app/services/provincias.service';
import Swal from 'sweetalert2';
import { Provincia } from 'src/app/models/provincia.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { Categoria } from 'src/app/models/categoria.model';


@Component({
  selector: 'app-crear-actividad',
  templateUrl: './crear-actividad.component.html',
  styleUrls: ['./crear-actividad.component.css']
})
export class CrearActividadComponent implements OnInit {

  public registerForm = this.fb.group({
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

  public fechaInvalida: boolean = false;
  public faltaCategoria: boolean = false;

  public hoy: any;

  public actividadId: any;
  public nuevo: boolean = false;
  public titulo: string = "Editar Actividad";
  public usuarioId: any;

  public listaCategorias: Categoria[] = [];
  public listaFotos: any[] = [];
  public listaArchivos: any[] = [];

  public filechanged: boolean = false;
  public organizador: any;

  public listaProvincias: Provincia[] = [];
  public participa: boolean = false;

  public formSubmit = false;
  public waiting = false;
  // public participacion = [
  //   {id: 1, nombre: "Sí", marcado: false},
  //   {id: 2, nombre: "No", marcado: false},
  // ];
  public checked1: boolean = false;
  public checked2: boolean = false;
  public pathFotos: string = "";

  constructor(private fb: FormBuilder,
              private actividadService: ActividadesService,
              private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private categoriasService: CategoriasService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.actividadId = this.route.snapshot.params['uid'];
    this.cargarProvincias();
    this.queDiaEsHoy();
    this.cargarCategorias();
    this.cargarOrganizador();
    if(!this.actividadId){
      this.actividadId = 'nuevo';
      this.nuevo = true;
      this.titulo = "Crear Actividad";
    }else{
      this.cargarActividad();
    }
    this.pathFotos = "../../../assets/imgs/actividades/";
  }

  cargarActividad(){
    this.actividadService.cargarActividad(this.actividadId)
    .subscribe(( res: any) => {
      let actividad = res['existeActividad'];
      console.log(actividad);
      this.registerForm.get('titulo')?.setValue(actividad.titulo);
      this.registerForm.get('descripcion')?.setValue(actividad.descripcion);
      this.registerForm.get('requisitos')?.setValue(actividad.requisitos);
      this.registerForm.get('imagenes')?.setValue(actividad.fotos);
      this.registerForm.get('min_participantes')?.setValue(actividad.min_participantes);
      this.registerForm.get('max_participantes')?.setValue(actividad.max_participantes);
      this.registerForm.get('direccion')?.setValue(actividad.direccion);
      this.registerForm.get('poblacion')?.setValue(actividad.poblacion);
      this.registerForm.get('provincia')?.setValue(actividad.provincia);
      this.registerForm.get('pais')?.setValue(actividad.pais);
      let fecha = new Date(actividad.fecha);
      this.registerForm.get('fecha')?.setValue(this.convertirFecha(fecha));
      this.registerForm.get('hora')?.setValue(this.convertirHora(fecha));
      this.registerForm.get('participa')?.setValue(actividad.participa);
      this.organizador = actividad.organizador;
      if(actividad.participa){
        this.participa = true;
      }
      this.registerForm.get('precio')?.setValue(actividad.precio);
      for(let i = 0; i < actividad.categorias.length; i++){
        for(let j = 0; j < this.listaCategorias.length; j++){
          if(actividad.categorias[i] === this.listaCategorias[j].uid){
            this.listaCategorias[j].marcado = true;
          }
        }
      }
      for(let i = 0; i < actividad.fotos.length; i++){
        if(actividad.fotos[i] !== ""){
          let img = this.pathFotos + actividad.fotos[i];
          this.listaFotos.push(img);
        }
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarOrganizador(){
    let email = localStorage.getItem('email');
    if(!email){
      email = "";
    }
    this.usuarioService.cargarUsuario("", email)
    .subscribe((res: any) => {
      this.usuarioId = res['existeUsuario'].uid;
    }, (err: any) => {
      console.log(err);
    });
  }

  convertirFechayHora(){
    let fecha = new Date(this.registerForm.get('fecha')?.value);
    let nuevaFecha = new Date();
    let sh: number = this.registerForm.get('hora')?.value.split(':')[0];
    let sm: number = this.registerForm.get('hora')?.value.split(':')[1];
    nuevaFecha.setFullYear(fecha.getFullYear());
    nuevaFecha.setMonth(fecha.getMonth());
    nuevaFecha.setDate(fecha.getDate());
    nuevaFecha.setHours(sh);
    nuevaFecha.setMinutes(sm);
    return nuevaFecha;
  }

  crearActividad(){
    this.formSubmit = true;
    if(this.nuevo){
      this.registerForm.get('organizador')?.setValue(this.organizador);
      console.log(this.registerForm.value);
      if (!this.registerForm.valid) {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
        console.log('el formulario no es válido');
        return;
      }
      this.waiting = true;
      console.log('quiero crear una actividad');

      let categorias = [];
      for(let i = 0; i < this.listaCategorias.length; i++){
        if(this.listaCategorias[i].marcado){
          categorias.push(this.listaCategorias[i].uid);
        }
      }
      this.registerForm.get('fecha')?.setValue(this.convertirFechayHora());
      this.registerForm.get('participa')?.setValue(this.participa);
      this.registerForm.get('categorias')?.setValue(categorias);
      this.registerForm.get('organizador')?.setValue(this.usuarioId);
      console.log(this.registerForm.value);
      this.actividadService.crearActividad(this.registerForm.value)
      .subscribe((res: any) => {
        if(this.filechanged){
          this.subirFotos(res['actividad'].uid);
        }else{
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Actividad creada correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/actividades');
              }
          });
        }
        this.waiting = false;
      }, (err: any) => {
        console.log(err);
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }else{
      this.waiting = true;
      let categorias = [];
      for(let i = 0; i < this.listaCategorias.length; i++){
        if(this.listaCategorias[i].marcado){
          categorias.push(this.listaCategorias[i].uid);
        }
      }
      this.registerForm.get('fecha')?.setValue(this.convertirFechayHora());
      this.registerForm.get('categorias')?.setValue(categorias);
      this.registerForm.get('organizador')?.setValue(this.organizador);
      if(this.filechanged){
        this.subirFotos(this.actividadId);
      }else{
        this.registerForm.get('fotos')?.setValue(this.registerForm.controls['imagenes'].value);
        console.log(this.registerForm.value);
        this.actividadService.actualizarActividad(this.actividadId, this.registerForm.value)
        .subscribe( (res: any) => {
          this.waiting = false;
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Actividad actualizada correctamente'
            }).then((result) => {
                if (result.isConfirmed) {
                  this.router.navigateByUrl('/admin/actividades');
                }
            });
        }, (err: any) => {
          this.waiting = false;
          console.log(err);
        });
      }


    }
  }


  cargarProvincias(){
    this.provinciaService.cargarProvincias()
    .subscribe((res: any) => {
      console.log(res);
      this.listaProvincias = res['provincias'];
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  cargarCategorias(){
    this.categoriasService.cargarCategorias()
    .subscribe((res: any) => {
      this.listaCategorias = res['categorias'];
      console.log(this.listaCategorias);
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  async selectFiles(event: any){
    this.filechanged = true;
    const filesToUpload = event.target.files;
    this.listaArchivos.push(filesToUpload[0]);
    console.log(filesToUpload);
    var reader = new FileReader();
    // this.imagePath = event.target.files;
    reader.readAsDataURL(filesToUpload[0]);
    reader.onload = (_event) => {
      this.listaFotos.push(reader.result);
    }
  }

  subirFotos(idActividad: string){
    const formData = new FormData();
    console.log(this.listaArchivos);
    for(let i = 0; i < this.listaArchivos.length; i++){
      formData.append('fotos', this.listaArchivos[i]);
    }
    console.log(formData);
    this.actividadService.subirFotos(idActividad, formData)
    .subscribe((res: any) => {
      console.log(res);
      let fotos = this.registerForm.get('imagenes')?.value;
      if(!fotos){
        fotos = [];
      }
      for(let i = 0; i < res['listaFotos'].length; i++){
        if(fotos[0] == ""){
          fotos[0] = res['listaFotos'][i];
        }else{
          fotos.push(res['listaFotos'][i]);
        }
      }
      this.registerForm.get('imagenes')?.setValue(fotos);
      this.registerForm.get('fotos')?.setValue(fotos);
      this.actividadService.actualizarActividad(idActividad, this.registerForm.value)
      .subscribe( (res: any) => {
        console.log(res);
        if(this.nuevo){
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Actividad creada correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/actividades');
              }
          });
        }else{
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Actividad actualizada correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/actividades');
              }
          });
        }

      }, (err: any) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  onCheckboxChange(e:any, uid: any) {
    if (e.target.checked) {
      for(let i = 0; i < this.listaCategorias.length; i++){
        if(this.listaCategorias[i].uid === uid){
          this.listaCategorias[i].marcado = true;
        }
      }
    } else {
      for(let i = 0; i < this.listaCategorias.length; i++){
        if(this.listaCategorias[i].uid === uid){
          this.listaCategorias[i].marcado = false;
        }
      }
    }
  }

  borrarFotos(){
    console.log("Quiero borrar fotos");
    this.listaFotos = [];
    this.listaArchivos = [];
    if(!this.nuevo){
      this.actividadService.borrarFotos(this.actividadId)
      .subscribe((res: any) => {
        let fotos: any = [];
        this.registerForm.get('imagenes')?.setValue(fotos);
        console.log(res);
      }, (err: any) => {
        console.log(err);
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }
  }

  // seleccionar(id: any){
  //   for(let i = 0; i < this.motivos.length; i++){
  //     if(id == this.motivos[i].id){
  //       this.motivos[i].marcado = true;
  //       this.valido = true;
  //       if(this.alerta){
  //         this.alerta = false;
  //       }
  //     }else{
  //       this.motivos[i].marcado = false;
  //     }
  //   }
  // }
  onCheckboxChange2(num: number){
    if(num == 1){
      if(this.checked1 == false){
        this.participa = true;
        this.checked1 = true;
        this.checked2 = false;
      }else{
        this.participa = false;
        this.checked1 = false;
        this.checked2 = true;
      }
    }else{
      if(this.checked2 == false){
        this.participa = false;
        this.checked2 = true;
        this.checked1 = false;
      }else{
        this.participa = true;
        this.checked2 = false;
        this.checked1 = true;
      }
    }
    this.registerForm.get('participa')?.setValue(this.participa);
  }

  convertirFecha(datecita: Date): string{
    let year = datecita.getFullYear().toString();
    let month = datecita.getMonth()+1;
    let dt = datecita.getDate();
    let stringo= '', sdia='', smes='', syear='';

    if (dt < 10) {
      sdia = '0' + dt.toString();
    }else{
      sdia = dt.toString();
    }
    if (month < 10) {
      smes = '0' + month.toString();
    }else{
      smes = month.toString();
    }
    syear = year.toString();
    stringo = syear + '-' + smes + '-' + sdia;
    return stringo;
  }

  convertirHora(fecha: Date): string{
    let hora = fecha.getHours();
    let minutos = fecha.getMinutes();
    let shora = "", sminut = "";
    if(hora < 10){
      shora = "0" + hora.toString();
    }else{
      shora = hora.toString();
    }
    if(minutos < 10){
      sminut = "0" + minutos.toString();
    }else{
      sminut = minutos.toString();
    }
    let resultado = "";
    resultado = shora + ":" + sminut;
    return resultado;
  }

  get arrayCategorias() {
    return this.registerForm.controls["categorias"] as FormArray;
  }

  logout(): void {
    this.usuarioService.logout();
  }

  campoValido(campo: string) {
    if(campo === 'hora'){
      if(this.registerForm.get('fecha')?.value != '' && this.registerForm.get('hora')?.value != ''){
        var fechaActual = new Date();
        var f = this.registerForm.get(campo)?.value;
        var hour = f.split(":")[0] - fechaActual.getHours();
        if(hour < 2){
          this.fechaInvalida = true;
        }
        if(hour == 2){
          let mins = f.split(":")[1] - fechaActual.getMinutes();
          if(mins >= 0){
            this.fechaInvalida = false;
          }else{
            this.fechaInvalida = true;
          }
        }
      }else{
        this.fechaInvalida = false;
      }
    }
    this.comprobarCategorias();
    return this.registerForm.get(campo)?.valid || !this.formSubmit;
  }

  comprobarCategorias(){
    let cont = 0;
    for(let i = 0; i < this.listaCategorias.length; i++){
      if(this.listaCategorias[i].marcado == true){
        cont++;
      }
    }
    if(cont < 1){
      this.faltaCategoria = true;
    }else{
      this.faltaCategoria = false;
    }
  }

  queDiaEsHoy(){
    this.hoy =  new Date().toISOString().slice(0, 10);
  }

}
