import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProvinciaService } from 'src/app/services/provincias.service';
import { Provincia } from 'src/app/models/provincia.model';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  public registerForm = this.fb.group({
    nombre: ['', Validators.required ],
    apellidos: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    confirmPassword: ['', Validators.required ],
    fecha_nacimiento: ['', Validators.required ],
    pais: ['', Validators.required ],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    imagen: [''],
    foto: [''],
    token: ['']
  });

  public listaProvincias: Provincia[] = [];

  public fotoPerfilURL: any;
  public imagePath: any;
  public filechanged = false;

  public formSubmit = false;
  public waiting = false;

  public mostrarPass1 = false;
  public mostrarPass2 = false;

  public fechaInvalida: boolean = false;

  public usuarioId: any;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private zone: NgZone,
              private provinciaService: ProvinciaService,) { }

  ngOnInit(): void {
    this.fotoPerfilURL = "../../../assets/imgs/profile.png";
    this.cargarProvincias();
  }

  register() {
    this.formSubmit = true;
    console.log('quiero registrarme');
    // console.log(this.registerForm.value);
    if (!this.registerForm.valid) {
      console.log('el formulario no es válido');
      return;
    }
    this.waiting = true;
    let subirFoto = false;
    // if(this.registerForm.controls['checkbox']){
      console.log(this.registerForm.value);
      this.waiting = true;
      if(this.registerForm.get('imagen')?.value == ""){
        this.registerForm.controls['foto'].setValue("profile.jpg");
        subirFoto = false;
      }else{
        subirFoto = true;
      }
      this.usuarioService.registrarUsuario(this.registerForm.value)
      .subscribe(
        (res: any) => {
          console.log(res);
          this.waiting = false;
          this.router.navigateByUrl('/login');
          this.usuarioId = res['usuarioNuevo'].uid;
          this.registerForm.controls['token'].setValue(res['token']);
          if(subirFoto){
            this.subirFoto(res['token']);
          }
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario creado'});
          this.usuarioService.enviarEmail(this.registerForm.value)
          .subscribe( (res: any) => {
            console.log(res);
            this.waiting = false;
            this.router.navigateByUrl(`/verification/validar/${this.registerForm.controls['email'].value}`);
          }, (err:any) => {
            console.log(err);
            // const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
            // Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
            this.waiting = false;
          });
        },
        (err: any) => {
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
          this.waiting = false;
        }
      );
    // }
  }

  sonIguales(): boolean {
    let pass = this.registerForm.controls['password'].value;
    let pass2 = this.registerForm.controls['confirmPassword'].value;
    return pass === pass2;
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.registerForm.controls['password'].dirty &&
    this.registerForm.controls['confirmPassword'].dirty){
      return false;
    }
    return  true;
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

  campoValido(campo: string) {
    if(campo === 'fecha_nacimiento'){
      if(this.registerForm.get(campo)?.value != ''){

        var hoy = new Date();
        var f = new Date(this.registerForm.get(campo)?.value);
        var edad = hoy.getFullYear() - f.getFullYear();
        console.log(edad);
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

  subirFoto(token: any){
    const formData = new FormData();
    formData.append('foto', this.registerForm.get('imagen')?.value);
    console.log(formData);
    this.usuarioService.subirImagen(this.usuarioId, formData, token)
    .subscribe((res: any) => {
      this.fotoPerfilURL = '../assets/imgs/usuarios/'+res['nombreArchivo'];
    }, (err) => {
      console.log(err);
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  mostrarPassword(pos: number){
    switch(pos){
      case 1:
        if(this.mostrarPass1){
          this.mostrarPass1 = false;
        }else{
          this.mostrarPass1 = true;
        }
        break;
      case 2:
        if(this.mostrarPass2){
          this.mostrarPass2 = false;
        }else{
          this.mostrarPass2 = true;
        }
        break;
    }
  }
}
