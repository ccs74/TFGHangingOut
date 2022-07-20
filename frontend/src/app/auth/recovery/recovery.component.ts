import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.css']
})
export class RecoveryComponent implements OnInit {

  public recoveryPassForm = this.fb.group({
    email: ['', [ Validators.required, Validators.email] ],
    newPassword: ['', Validators.required ],
    newPassword2: ['', [ Validators.required, Validators.email] ],
  });

  public emailForm = this.fb.group({
    email: ['', [ Validators.required, Validators.email] ],
  });

  public idUsuario: any;

  public email!: string;
  public recuperar = false;

  public formSubmit = false;
  public waiting = false;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.params['email'];
    if(this.email == undefined){
      this.recuperar = true;
    }else{
      this.recoveryPassForm.get('email')?.setValue(this.email);
    }
    console.log(this.recuperar);
  }

  cargarUsuario(){
    console.log(this.email);
    this.usuarioService.cargarUsuario("", this.email)
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
    if (!this.emailForm.valid) {
      return;
    }
    this.waiting = true;
    console.log(this.recoveryPassForm.value);
    this.usuarioService.resetPass(this.recoveryPassForm.value)
    .subscribe((res: any) => {
      console.log(res);
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Contraseña Cambiada'
      }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/login');
          }
      });
    }, (err: any) => {
      console.log(err);
    });
  }

  enviarEmail(){
    console.log(this.emailForm.value);
    this.usuarioService.enviarEmail(this.emailForm.value)
    .subscribe((res: any) => {
      console.log(res);
    }, (err: any) => {
      console.log(err);
    });
  }

  campoValido(campo: string, form: string) {
    if(form == "email"){
      return this.emailForm.get(campo)?.valid || !this.formSubmit;
    }else{
      return this.recoveryPassForm.get(campo)?.valid || !this.formSubmit;
    }
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.recoveryPassForm.controls['newPassword'].dirty &&
    this.recoveryPassForm.controls['newPassword2'].dirty){
      return false;
    }
    return  true;
  }

  sonIguales(): boolean {
    let pass = this.recoveryPassForm.controls['newPassword'].value;
    let pass2 = this.recoveryPassForm.controls['newPassword2'].value;
    return pass === pass2;
  }

}
