import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CategoriasService } from 'src/app/services/categorias.service';
import { Categoria } from 'src/app/models/categoria.model';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';
@Component({
  selector: 'app-crear-categoria',
  templateUrl: './crear-categoria.component.html',
  styleUrls: ['./crear-categoria.component.css']
})
export class CrearCategoriaComponent implements OnInit {

  public registerForm = this.fb.group({
    nombre: ['', Validators.required ],
  });

  public categoriaId: any;
  public nuevo: boolean = false;
  public titulo: string = "Editar Categoria";

  public formSubmit = false;
  public waiting = false;

  constructor(private fb: FormBuilder,
              private categoriasService: CategoriasService,
              private router: Router,
              private route: ActivatedRoute,
              private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.params['uid'];
    if(!this.categoriaId){
      this.categoriaId = 'nuevo';
      this.nuevo = true;
      this.titulo = "Crear Categoría";
    }else{
      this.cargarCategoria();
    }
  }

  cargarCategoria(){
    this.categoriasService.cargarCategorias("", this.categoriaId)
    .subscribe((res: any) => {
      console.log(res['categorias']);
      this.registerForm.get('nombre')?.setValue(res['categorias'].nombre);
    }, (err: any) =>{
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  crearCategoria(){
    this.formSubmit = true;
    if (!this.registerForm.valid) {
      console.log('el formulario no es válido');
      return;
    }
    this.waiting = true;
    if(this.nuevo){
      this.categoriasService.crearCategoria(this.registerForm.value)
      .subscribe( (res: any) => {
        console.log(res);
        this.waiting = false;
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Categoría creada correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/categorias');
              }
          });
      }, (err: any) => {
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }else{
      this.categoriasService.actualizarCategoria(this.categoriaId, this.registerForm.value)
      .subscribe( (res: any) => {
        console.log(res);
        this.waiting = false;
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Categoría actualizada correctamente'
          }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/admin/categorias');
              }
          });
      }, (err: any) => {
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }
  }

  campoValido(campo: string) {
    return this.registerForm.get(campo)?.valid || !this.formSubmit;
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
