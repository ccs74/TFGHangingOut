import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { FormBuilder, Validators } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  public listaUsuarios: Usuario[] = [];
  public path: string = '';

  public idUsuario: any;

  public mostrarBuscador: boolean = false;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.path = "../../../assets/imgs/";
    this.cargarUsuarioAdmin();
    this.cargarUsuarios("");
    localStorage.setItem('before', `/admin/usuarios`);
  }

  cargarUsuarioAdmin(){
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
      console.log(err);
    });
  }

  cargarUsuarios(textoBuscar: string){
    this.usuarioService.cargarUsuarios(textoBuscar)
    .subscribe( (res: any) => {
      this.listaUsuarios = res['usuarios'];
      console.log(this.listaUsuarios);
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
    });
  }

  activarBuscador(){
    this.mostrarBuscador = true;
  }

  borrarUsuario(uid: string, nombre?: string){
    Swal.fire({
      title: 'Eliminar Usuario',
      text: `Al eliminar el usuario ${nombre} se perderán todos los datos asociados, ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if(result.value){
        this.usuarioService.borrarUsuario(uid)
        .subscribe( resp => {
          this.cargarUsuarios("");
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelta a intentarlo',});
        })
      }
    });
  }

  desbloquear(uid: any){
    this.usuarioService.bloquearUsuario(this.idUsuario, uid)
    .subscribe((res: any) => {
      console.log(res);
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Usuario desbloqueado'});
      this.cargarUsuarios("");
    }, (err: any) => {
      console.log(err);
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  logout(): void {
    this.usuarioService.logout();
  }
}
