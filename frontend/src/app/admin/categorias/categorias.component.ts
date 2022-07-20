import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriasService } from 'src/app/services/categorias.service';
import { Categoria } from 'src/app/models/categoria.model';
import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {

  public listaCategorias: Categoria[] = [];
  public mostrarBuscador: boolean = false;

  constructor(private categoriasService: CategoriasService,
              private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarCategorias("");
  }

  cargarCategorias(textoBuscar: string){
    this.categoriasService.cargarCategorias(textoBuscar)
    .subscribe((res: any) => {
      this.listaCategorias = res['categorias'];
      console.log(this.listaCategorias);
    }, (err: any) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      console.log(err);
    });
  }

  activarBuscador(){
    if(this.mostrarBuscador){
      this.mostrarBuscador = false;
    }else{
      this.mostrarBuscador = true;
    }

  }

  borrarCategoria(uid: string, nombre?: string){
    Swal.fire({
      title: 'Eliminar Categoría',
      text: `Al eliminar la categoría ${nombre} se perderán todos los datos asociados, ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if(result.value){
        this.categoriasService.borrarCategoria(uid)
        .subscribe( resp => {
          this.cargarCategorias("");
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelta a intentarlo',});
        })
      }
    });
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
