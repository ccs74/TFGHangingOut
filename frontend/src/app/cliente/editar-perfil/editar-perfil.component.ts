import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ProvinciaService } from 'src/app/services/provincias.service';
import Swal from 'sweetalert2';
import { Provincia } from 'src/app/models/provincia.model';
import { Categoria } from 'src/app/models/categoria.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActividadesService } from '../../services/actividades.service';
import { Actividad } from 'src/app/models/actividad.model';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {

  public usuarioForm = this.fb.group({
    nombre: ['', Validators.required ],
    apellidos: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    fecha_nacimiento: ['', Validators.required ],
    pais: ['', Validators.required ],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    imagen: [''],
    foto: [''],
    intereses: ['', Validators.required ],
    firstTime: ['']
  });

  public formSubmit = false;
  public waiting = false;

  public fechaInvalida: boolean = false;
  public faltanIntereses: boolean = false;

  public idUsuario: any;

  public totalOrganizadas: number = 0;
  public totalAsistidas: number = 0;

  public fotoPerfilURL: any;
  public imagePath: any;
  public filechanged = false;

  public email: any;

  public listaProvincias: Provincia[] = [];
  public listaCategorias: Categoria[] = [];

  public before: any;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private categoriaService: CategoriasService,
              private actividadesService: ActividadesService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarProvincias();
    this.cargarCategorias();
    this.cargarActividades();
    this.fotoPerfilURL = "../../../assets/imgs/usuarios/profile.png";
    this.before = localStorage.getItem('before');
    // localStorage.setItem('before', `/editar-perfil`);
  }

  cargarActividades(){
    this.actividadesService.cargarActividades()
    .subscribe((res: any) => {
      let actividades = res['actividades'];
      this.totalOrganizadas = 0;
      for(let i = 0; i < actividades.length; i++){
        if(actividades[i].organizador == this.idUsuario){
          this.totalOrganizadas = this.totalOrganizadas + 1;
        }
      }
    }, (err: any) => {
      console.log(err);
    });

  }

  actualizarUsuario(){
    this.formSubmit = true;
    if (!this.usuarioForm.valid) {
      console.log('el formulario no es válido');
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      return;
    }
    this.waiting = true;
    if(this.filechanged){
      if(this.usuarioForm.get('foto')?.value !== "profile.png"){
        this.borrarFoto();
      }
      this.subirFoto();
    }else{
      console.log(this.usuarioForm.value);
      this.usuarioService.actualizarUsuario(this.idUsuario, this.usuarioForm.value)
      .subscribe((res: any) => {
        console.log(res);
        this.waiting = false;
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario Actualizado Correctamente'
        }).then((result) => {
            if (result.isConfirmed) {
              console.log(localStorage.getItem('before'));
              this.router.navigateByUrl(localStorage.getItem('before') || '/resultados-actividades/');
            }
        });
      }, (err: any) => {
            this.waiting = false;
            console.log(err);
            const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
            Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});

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
      if(res['existeUsuario'].foto != ""){
        this.fotoPerfilURL = "../../../assets/imgs/usuarios/" + res['existeUsuario'].foto;
      }
      this.idUsuario = res['existeUsuario'].uid;
      this.totalAsistidas = res['existeUsuario'].actividades_asistidas.length;
      if(res['existeUsuario'].actividades_organizadas){
        this.totalOrganizadas = res['existeUsuario'].actividades_organizadas.length;
      }

      this.usuarioForm.get('nombre')?.setValue(res['existeUsuario'].nombre);
      this.usuarioForm.get('apellidos')?.setValue(res['existeUsuario'].apellidos);
      this.usuarioForm.get('email')?.setValue(res['existeUsuario'].email);
      this.email = res['existeUsuario'].email;
    console.log(this.email);
      let fecha = new Date(res['existeUsuario'].fecha_nacimiento);
      this.usuarioForm.get('fecha_nacimiento')?.setValue(this.convertirFecha(fecha));
      this.usuarioForm.get('pais')?.setValue(res['existeUsuario'].pais);
      this.usuarioForm.get('poblacion')?.setValue(res['existeUsuario'].poblacion);
      this.usuarioForm.get('provincia')?.setValue(res['existeUsuario'].provincia);
      this.usuarioForm.get('descripcion')?.setValue(res['existeUsuario'].descripcion);
      this.usuarioForm.get('foto')?.setValue(res['existeUsuario'].foto);
      this.usuarioForm.get('intereses')?.setValue(res['existeUsuario'].intereses);
      this.usuarioForm.get('firstTime')?.setValue(res['existeUsuario'].firstTime);
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
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
    this.categoriaService.cargarCategorias()
    .subscribe((res: any) => {
      this.listaCategorias = res['categorias'];
      let intereses = this.usuarioForm.get('intereses')?.value;
      for(let i = 0; i < this.listaCategorias.length; i++){
        this.listaCategorias[i].marcado = false;
        this.listaCategorias[i].clase = "categoria";
      }
      for(let i = 0; i < this.listaCategorias.length; i++){
        for(let j = 0; j < intereses.length; j++){
          if(this.listaCategorias[i].uid == intereses[j]){
            this.listaCategorias[i].marcado = true;
            this.listaCategorias[i].clase = "categoria-selected";
          }
        }
      }
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      console.log(err);
    });
  }

  logout(): void {
    this.usuarioService.logout();
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
    this.usuarioForm.get('intereses')?.setValue(intereses);
    console.log(this.listaCategorias);
  }

  comprobarCategorias(){
    let cont = 0;
    for(let i = 0; i < this.listaCategorias.length; i++){
      if(this.listaCategorias[i].marcado == true){
        cont++;
      }
    }
    if(cont < 3){
      this.faltanIntereses = true;
    }else{
      this.faltanIntereses = false;
    }
  }

  onFileSelect(event: any){
    this.filechanged = true;
    const filesToUpload = event.target.files[0];
    this.usuarioForm.get('imagen')?.setValue(filesToUpload);

    var reader = new FileReader();
    this.imagePath = event.target.files;
    reader.readAsDataURL(filesToUpload);
    reader.onload = (_event) => {
      this.fotoPerfilURL = reader.result;
    }
  }

  subirFoto(){
    const formData = new FormData();
    console.log(this.usuarioForm.get('imagen')?.value);
    formData.append('foto', this.usuarioForm.get('imagen')?.value);
    console.log(formData);
    this.usuarioService.subirImagen(this.idUsuario, formData)
    .subscribe((res: any) => {
      console.log(res);
      this.fotoPerfilURL = '../assets/imgs/usuarios/'+res['nombreArchivo'];
      this.usuarioForm.get('foto')?.setValue(res['nombreArchivo']);
      this.usuarioService.actualizarUsuario(this.idUsuario, this.usuarioForm.value)
          .subscribe((res: any) => {
            console.log(res);
            this.waiting = false;
            Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario Actualizado Correctamente'
            }).then((result) => {
                if (result.isConfirmed) {
                  console.log(localStorage.getItem('before'));
                  this.router.navigateByUrl(localStorage.getItem('before') || '/resultados-actividades/');
                }
            });
          }, (err: any) => {
            console.log(err);
            this.waiting = false;
          });
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  borrarFoto(){
    this.usuarioService.borrarFoto(this.idUsuario)
    .subscribe((res: any) => {
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      console.log(err);
    });
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

  campoValido(campo: string) {
    if(campo === 'fecha_nacimiento'){
      if(this.usuarioForm.get(campo)?.value != ''){

        var hoy = new Date();
        var f = new Date(this.usuarioForm.get(campo)?.value);
        var edad = hoy.getFullYear() - f.getFullYear();
        var mes = hoy.getMonth() - f.getMonth();
        if(mes < 0 || (mes === 0 && hoy.getDate() < f.getDate())){
          edad--;
        }
        if(edad >= 16){
          this.fechaInvalida = false;
        }else{
          this.fechaInvalida = true;
        }
      }else{
        this.fechaInvalida = false;
      }
    }
    this.comprobarCategorias();
    return this.usuarioForm.get(campo)?.valid || !this.formSubmit;
  }

}
