import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-pass',
  templateUrl: './cambiar-pass.component.html',
  styleUrls: ['./cambiar-pass.component.css']
})
export class CambiarPassComponent implements OnInit {

  public recoveryPassForm = this.fb.group({
    password: ['', Validators.required ],
    newPassword: ['', Validators.required ],
    newPassword2: ['', [ Validators.required ] ],
  });

  public formSubmit = false;
  public waiting = false;

  public idUsuario: any;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private route: ActivatedRoute) { }

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
      console.log(this.idUsuario);
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  restablecerPass(){
    this.formSubmit = true;
    if (!this.recoveryPassForm.valid) {
      console.log('el formulario no es válido');
      return;
    }
    this.waiting = true;
    console.log(this.recoveryPassForm.value);
    this.usuarioService.restablecerPass(this.idUsuario, this.recoveryPassForm.value)
    .subscribe((res: any) => {
      console.log(res);
      this.waiting = true;
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Contraseña Cambiada'
      }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/editar-perfil');
          }
      });
    }, (err: any) => {
      console.log(err);
      this.waiting = true;
    });
  }

  sonIguales(): boolean {
    let pass = this.recoveryPassForm.controls['newPassword'].value;
    let pass2 = this.recoveryPassForm.controls['newPassword2'].value;
    return pass === pass2;
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.recoveryPassForm.controls['newPassword'].dirty &&
    this.recoveryPassForm.controls['newPassword2'].dirty){
      return false;
    }
    return  true;
  }

  campoValido(campo: string) {
    return this.recoveryPassForm.get(campo)?.valid || !this.formSubmit;
  }

}
