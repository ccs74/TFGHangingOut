import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ProvinciaService } from 'src/app/services/provincias.service';
import Swal from 'sweetalert2';
import { Provincia } from 'src/app/models/provincia.model';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {


  public registerForm = this.fb.group({
    nombre: ['', Validators.required ],
    apellidos: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    confirmPassword: ['' ],
    fecha_nacimiento: ['', Validators.required ],
    pais: ['', Validators.required ],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    imagen: [''],
    foto: [''],
    estado: ['']
  });

  public fotoForm = this.fb.group({
    nombre: ['', Validators.required ],
    apellidos: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    fecha_nacimiento: ['', Validators.required ],
    pais: ['', Validators.required ],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    foto: [''],
  });

  public formSubmit = false;
  public waiting = false;
  public fechaInvalida: boolean = false;

  public fotoPerfilURL: any;
  public imagePath: any;
  public filechanged = false;

  public usuarioId: any;
  public nuevo: boolean = false;
  public titulo: string = "Editar Usuario";

  public listaProvincias: Provincia[] = [];

  public before: any;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private router: Router,
              private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.params['uid'];
    if(!this.usuarioId){
      this.usuarioId = 'nuevo';
      this.nuevo = true;
      this.titulo = "Crear Usuario";
    }else{
      this.cargarUsuario();
    }
    this.cargarProvincias();
    this.fotoPerfilURL = "../../../assets/imgs/usuarios/profile.png";
    this.before = localStorage.getItem('before');
  }

  cargarUsuario(){
    this.usuarioService.cargarUsuario(this.usuarioId)
    .subscribe((res: any) => {
      let usuario = res['existeUsuario']
      if(usuario.foto != ""){
        this.fotoPerfilURL = "../../../assets/imgs/usuarios/" + usuario.foto;
      }
      this.fotoForm.get('foto')?.setValue(usuario.foto);
      console.log(res['existeUsuario']);
      this.registerForm.get('nombre')?.setValue(usuario.nombre);
      this.registerForm.get('apellidos')?.setValue(usuario.apellidos);
      this.registerForm.get('email')?.setValue(usuario.email);
      let fecha = new Date(usuario.fecha_nacimiento);
      this.registerForm.get('fecha_nacimiento')?.setValue(this.convertirFecha(fecha));
      this.registerForm.get('pais')?.setValue(usuario.pais);
      this.registerForm.get('poblacion')?.setValue(usuario.poblacion);
      this.registerForm.get('provincia')?.setValue(usuario.provincia);
      this.registerForm.get('descripcion')?.setValue(usuario.descripcion);
      this.registerForm.get('foto')?.setValue(usuario.foto);
      this.registerForm.get('passsword')?.setValue(usuario.password);
      this.registerForm.get('confirmPassword')?.setValue(usuario.password);
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      this.waiting = false;
    });
  }

  crearUsuario(){
    this.formSubmit = true;
    console.log(this.registerForm.value);

    this.waiting = true;
    if(this.nuevo){
      // if(this.registerForm.controls['checkbox']){
        if (!this.registerForm.valid) {
          console.log('el formulario no es válido');
          return;
        }
        this.registerForm.get('confirmPassword')?.setValue(this.registerForm.get('password')?.value);
        this.registerForm.get('estado')?.setValue('Activo');
        console.log(this.registerForm.value);
        this.usuarioService.registrarUsuario(this.registerForm.value)
        .subscribe(
          (res: any) => {
            console.log(res);
            this.waiting = false;
            this.usuarioId = res['usuarioNuevo'].uid;
            if(this.registerForm.get('imagen')?.value == ""){
              this.registerForm.controls['foto'].setValue("profile.jpg");
              this.router.navigateByUrl('/admin/usuarios');
            }else{
              this.subirFoto();
            }
            Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario creado'});
          },
          (err: any) => {
            this.waiting = false;
            const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
            Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
          }
        );
    }else{
      if(this.filechanged){
        if(this.registerForm.get('foto')?.value !== "profile.png" && this.registerForm.get('foto')?.value !== ""){
          this.borrarFoto();
        }
        this.subirFoto();
      }else{
        this.actualizarVariables();
        console.log(this.fotoForm.value);
        this.usuarioService.actualizarUsuario(this.usuarioId, this.fotoForm.value)
        .subscribe((res: any) => {
          console.log(res);
          this.waiting = false;
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario modificado correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/usuarios');
              }
          });
        }, (err: any) => {
              console.log(err);
              const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
              Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
              this.waiting = false;
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

  onFileSelect(event: any){
    this.filechanged = true;
    const filesToUpload = event.target.files[0];
    this.registerForm.get('imagen')?.setValue(filesToUpload);

    var reader = new FileReader();
    this.imagePath = event.target.files;
    reader.readAsDataURL(filesToUpload);
    reader.onload = (_event) => {
      this.fotoPerfilURL = reader.result;
    }
  }

  actualizarVariables(){
    this.fotoForm.get('nombre')?.setValue(this.registerForm.get('nombre')?.value);
    this.fotoForm.get('apellidos')?.setValue(this.registerForm.get('apellidos')?.value);
    this.fotoForm.get('email')?.setValue(this.registerForm.get('email')?.value);
    if(this.nuevo){
      this.fotoForm.get('password')?.setValue(this.registerForm.get('password')?.value);
    }
    this.fotoForm.get('fecha_nacimiento')?.setValue(this.registerForm.get('fecha_nacimiento')?.value);
    this.fotoForm.get('pais')?.setValue(this.registerForm.get('pais')?.value);
    this.fotoForm.get('poblacion')?.setValue(this.registerForm.get('poblacion')?.value);
    this.fotoForm.get('provincia')?.setValue(this.registerForm.get('provincia')?.value);
    this.fotoForm.get('descripcion')?.setValue(this.registerForm.get('descripcion')?.value);
  }

  subirFoto(){
    const formData = new FormData();
    console.log(this.registerForm.get('imagen')?.value);
    formData.append('foto', this.registerForm.get('imagen')?.value);
    console.log(formData);
    this.usuarioService.subirImagen(this.usuarioId, formData)
    .subscribe((res: any) => {
      console.log(res);
      this.fotoPerfilURL = '../assets/imgs/usuarios/'+res['nombreArchivo'];
      this.fotoForm.get('foto')?.setValue(res['nombreArchivo']);
      this.actualizarVariables();
      this.usuarioService.actualizarUsuario(this.usuarioId, this.fotoForm.value)
          .subscribe((res: any) => {
            console.log(res);
            this.waiting = false;
            if(!this.nuevo){
              Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario modificado correctamente'
              }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigateByUrl('/admin/usuarios');
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

  borrarFoto(){
    this.usuarioService.borrarFoto(this.usuarioId)
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

  logout(): void {
    this.usuarioService.logout();
  }

  campoValido(campo: string) {
    if(campo === 'fecha_nacimiento'){
      if(this.registerForm.get(campo)?.value != ''){

        var hoy = new Date();
        var f = new Date(this.registerForm.get(campo)?.value);
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
    return this.registerForm.get(campo)?.valid || !this.formSubmit;
  }

}
