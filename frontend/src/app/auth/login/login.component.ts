import { Component, OnInit, NgZone, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare const gapi: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  public formSubmit = false;
  public waiting = false;
  public mostrarPass = false;
  public loginElement!: ElementRef;

  public auth2: any;

  public loginForm = this.fb.group({
    email: [localStorage.getItem('email') || '', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    remember: [false || localStorage.getItem('email')]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private zone: NgZone
             ) { }

    ngOnInit(): void {
    this.renderButton();
  }
  renderButton() {
    this.startApp();
  }

  startApp() {
    gapi.load('auth2', () => {
      const client_id = environment.client_id;
      this.auth2 = gapi.auth2.init({
        client_id,
        cookiepolicy: 'single_host_origin'
      });
      this.attachSignin(document.getElementById('my-signin2'));
    });
  };

  attachSignin(element: any) {

    this.auth2.attachClickHandler(element, {},
        (googleUser: any) => {
          var id_token = googleUser.getAuthResponse().id_token;
          this.waiting = true;
          this.usuarioService.loginGoogle(id_token)
          .subscribe( res => {
            this.usuarioService.cargarUsuario(res['uid'])
            .subscribe((ress: any) => {
              let rol = ress['existeUsuario'].rol;
              this.waiting = false;
              switch (rol) {
                case 'ROL_ADMIN':
                  localStorage.setItem('email', this.loginForm.get('email')?.value);
                  this.router.navigateByUrl('/admin/usuarios');
                  break;
                case 'ROL_USUARIO':
                  this.usuarioService.cargarUsuario("", this.loginForm.get('email')?.value)
                  .subscribe((res: any) => {
                    localStorage.setItem('email', this.loginForm.get('email')?.value);
                    if(res['existeUsuario'].firstTime == true){
                      this.router.navigateByUrl('/elegir-categorias');
                    }else{
                      this.router.navigateByUrl('/resultados-actividades');
                    }
                  }, (err: any) => {
                    Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
                  });
                  break;
              }
            }, (err: any) => {
              if(err.error.estado == 'Pendiente') {
                this.lanzarError({
                  title: 'Falta verificación',
                  text: 'Antes de iniciar sesión necesitamos verificar tu cuenta. Por favor, revisa en la bandeja de entrada de tu correo electrónico para activar tu cuenta.',
                  icon: 'warning',
                });
                return;
              }

              if(err.error.estado == 'pendienteGoogle') {
                this.waiting = false;
                Swal.fire({
                  title: 'Debes crear una contraseña',
                  text: 'Para poder iniciar sesión en nuestra plataforma debes crear una contraseña',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Crear Contraseña',
                  cancelButtonText: 'Cancelar',
                  allowOutsideClick: false
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigateByUrl('/recovery');
                  }
                });
              }

              this.lanzarError({
                title: 'Error!',
                text: `${err.error.msg}` || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
                icon: 'error',
              });
            });
          }, (err) => {
            Swal.fire({
              title: 'Error!',
              text: `${err.error.msg}` || 'Debes registrarte primero con tu cuenta de google para iniciar sesión',
              icon: 'error',
              confirmButtonText: 'Ok',
              allowOutsideClick: false
            })
            this.waiting = false;
          }
          );
        }, function(error: any) {
        });
  }


  login() {
    this.formSubmit = true;
    if (!this.loginForm.valid) {
      return;
    }
    this.waiting = true;
    console.log(this.loginForm.value);
    this.usuarioService.login(this.loginForm.value)
    .subscribe(
      (res) => {
        if (this.loginForm.get('remember')?.value) {
          localStorage.setItem('email', this.loginForm.get('email')?.value);
        } else {
          localStorage.removeItem('email');
        }
        this.waiting = false;
        switch (res.rol) {
            case 'ROL_ADMIN':
              localStorage.setItem('email', this.loginForm.get('email')?.value);
              this.router.navigateByUrl('/admin/usuarios');
              break;
            case 'ROL_USUARIO':
              this.usuarioService.cargarUsuario("", this.loginForm.get('email')?.value)
              .subscribe((res: any) => {
                localStorage.setItem('email', this.loginForm.get('email')?.value);
                if(res['existeUsuario'].firstTime == true){
                  this.router.navigateByUrl('/elegir-categorias');
                }else{
                  this.router.navigateByUrl('/resultados-actividades');
                }
              }, (err: any) => {
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
              });
              break;
          }
      },
      (err) => {

        if(err.error.estado == 'Pendiente') {
          this.lanzarError({
            title: 'Falta verificación',
            text: 'Antes de iniciar sesión necesitamos verificar tu cuenta. Por favor, revisa en la bandeja de entrada de tu correo electrónico para activar tu cuenta.',
            icon: 'warning',
          });
          return;
        }

        if(err.error.estado == 'pendienteGoogle') {
          this.waiting = false;
          Swal.fire({
            title: 'Debes crear una contraseña',
            text: 'Para poder iniciar sesión en nuestra plataforma debes crear una contraseña',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Crear Contraseña',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl('/recovery');
            }
          });
        }

        this.lanzarError({
          title: 'Error!',
          text: `${err.error.msg}` || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
          icon: 'error',
        });
      }
    );
  }

  lanzarError(datos: any) {
    Swal.fire({
      title: datos.title,
      text: datos.text,
      icon: datos.icon,
      confirmButtonText: 'Ok',
      allowOutsideClick: false
    });
    this.waiting = false;
  }

  mostrarPassword(){
    if(this.mostrarPass){
      this.mostrarPass = false;
    }else{
      this.mostrarPass = true;
    }
  }

  campoValido(campo: string) {
    return this.loginForm.get(campo)?.valid || !this.formSubmit;
  }

}
