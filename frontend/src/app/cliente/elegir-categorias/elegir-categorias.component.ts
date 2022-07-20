import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { Categoria } from 'src/app/models/categoria.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-elegir-categorias',
  templateUrl: './elegir-categorias.component.html',
  styleUrls: ['./elegir-categorias.component.css']
})
export class ElegirCategoriasComponent implements OnInit {

  public idUsuario: any;
  public listaCategorias: Categoria[] = [];

  public usuarioForm = this.fb.group({
    nombre: ['', Validators.required ],
    apellidos: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    fecha_nacimiento: ['', Validators.required ],
    pais: ['', Validators.required ],
    poblacion: ['', Validators.required ],
    provincia: ['', Validators.required ],
    descripcion: ['', Validators.required ],
    foto: [''],
    intereses: ['', Validators.required ],
    firstTime: ['']
  });

  public waiting = false;

  constructor(private usuarioService: UsuarioService,
              private categoriasService: CategoriasService,
              private fb: FormBuilder,
              private router: Router,) { }

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarCategorias();
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
      this.usuarioForm.get('nombre')?.setValue(res['existeUsuario'].nombre);
      this.usuarioForm.get('apellidos')?.setValue(res['existeUsuario'].apellidos);
      this.usuarioForm.get('email')?.setValue(res['existeUsuario'].email);
      this.usuarioForm.get('fecha_nacimiento')?.setValue(res['existeUsuario'].fecha_nacimiento);
      this.usuarioForm.get('pais')?.setValue(res['existeUsuario'].pais);
      this.usuarioForm.get('poblacion')?.setValue(res['existeUsuario'].poblacion);
      this.usuarioForm.get('provincia')?.setValue(res['existeUsuario'].provincia);
      this.usuarioForm.get('descripcion')?.setValue(res['existeUsuario'].descripcion);
      this.usuarioForm.get('foto')?.setValue(res['existeUsuario'].foto);
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  cargarCategorias(){
    this.categoriasService.cargarCategorias()
    .subscribe((res: any) => {
      this.listaCategorias = res['categorias'];
      for(let i = 0; i < this.listaCategorias.length; i++){
        this.listaCategorias[i].marcado = false;
        this.listaCategorias[i].clase = "categoria";
      }
      console.log(this.listaCategorias);
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      console.log(err);
    });
  }

  actualizarUsuario(){
    this.waiting = true;
    let intereses = [];
      for(let i = 0; i < this.listaCategorias.length; i++){
        if(this.listaCategorias[i].marcado){
          intereses.push(this.listaCategorias[i].uid);
        }
      }
    if(intereses.length == 0){
      Swal.fire({
        icon: 'warning',
        title: 'Debes seleccionar las categorías que te interesen',
        showConfirmButton: false,
        timer: 1500
      })
    }else{
      this.usuarioForm.get('intereses')?.setValue(intereses);
      this.usuarioForm.get('firstTime')?.setValue(false);
      this.usuarioService.actualizarUsuario(this.idUsuario, this.usuarioForm.value)
      .subscribe( ( res: any) => {
        console.log(res);
        this.router.navigateByUrl('/editar-perfil');
      }, (err: any) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        console.log(err);
      });
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
    console.log(this.listaCategorias);
  }

}
