import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ProvinciaService } from 'src/app/services/provincias.service';
import { Usuario } from 'src/app/models/usuario.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Provincia } from '../../models/provincia.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  public listaUsuarios: Usuario[] = [];
  public idUsuario: any;

  public listaSeguidos: Usuario[] = [];
  public listaNoSeguidos: Usuario[] = [];
  public listaTodos: Usuario[] = [];
  public listaBloqueados: Usuario[] = [];

  public bloqueados: any[] = [];

  public seguidos: any[] = [];
  public opcion: number = 0;

  public filtrosForm = this.fb.group({
    texto: [''],
    lugar: [''],
    min: [''],
    max: [''],
  });

  public listaProvincias: Provincia[] = [];

  public mostrarFiltros: boolean = false;

  constructor(private usuarioService: UsuarioService,
              private provinciaService: ProvinciaService,
              private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.cargarProvincias();
    this.cargarUsuario();
    this.cargarUsuarios();
  }

  cargarUsuario(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.seguidos = res['existeUsuario'].siguiendo;
      this.idUsuario = res['existeUsuario'].uid;
      this.bloqueados = res['existeUsuario'].bloqueados;
      console.log(this.idUsuario);
    }, (err: any) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  actualizarListas(){
    console.log(this.listaUsuarios);
    this.listaNoSeguidos = [];
    this.listaSeguidos = [];
    this.listaTodos = [];
    let pos = -1;
    for(let i = 0; i < this.listaUsuarios.length; i++){
      if(this.listaUsuarios[i].uid == this.idUsuario){
        pos = i;
      }
    }
    if(pos !== -1){
      // this.listaUsuarios.splice(pos, 1);
    }
    for(let i = 0; i < this.listaUsuarios.length; i++){
      let desc = this.listaUsuarios[i].descripcion || "";
      if(desc.length > 135){
        desc = desc.substring(0, 134);
        this.listaUsuarios[i].descripcion = desc;
      }
      if(this.listaUsuarios[i].seguido){
        this.listaSeguidos.push(this.listaUsuarios[i]);
      }else{
        this.listaNoSeguidos.push(this.listaUsuarios[i]);
      }
      this.listaTodos.push(this.listaUsuarios[i]);
    }
    console.log("todos: ", this.listaTodos);
  }
  cargarUsuarios(){
    console.log(this.filtrosForm.value);
    let texto, lugar, min, max;
    if(this.filtrosForm.get('texto')?.value){
      texto = this.filtrosForm.get('texto')?.value;
    }else{
      texto = "";
    }
    if(this.filtrosForm.get('lugar')?.value){
      lugar = this.filtrosForm.get('lugar')?.value;
    } else{
      lugar = "";
    }
    if(this.filtrosForm.get('min')?.value){
      min = this.filtrosForm.get('min')?.value;
    } else{
      min = "";
    }
    if(this.filtrosForm.get('max')?.value){
      max = this.filtrosForm.get('max')?.value;
    }else{
      max = "";
    }
    this.usuarioService.cargarUsuarios(texto, lugar, min, max)
    .subscribe((res: any) => {
      this.mostrarFiltros = false;
      // for(let i = 0; i < res['usuarios'].length; i++){
      //   if(res['usuarios'][i].estado == "Activo"){
      //     this.listaUsuarios.push(res['usuarios'][i]);
      //   }
      // }
      this.listaUsuarios = res['usuarios'];
      for(let i = 0; i < this.listaUsuarios.length; i++){
        this.listaUsuarios[i].seguido = false;
        this.getProvincia(this.listaUsuarios[i].provincia, i);
        this.listaUsuarios[i].bloqueado = false;
      }
      for(let i = 0; i < this.listaUsuarios.length; i++){
        for(let j = 0; j < this.seguidos.length; j++){
          if(this.listaUsuarios[i].uid == this.seguidos[j]){
            this.listaUsuarios[i].seguido = true;
            console.log("seguido");
          }
        }
      }
      this.listaBloqueados = [];
      for(let i = 0; i < this.bloqueados.length; i++){
        for(let j = 0; j < this.listaUsuarios.length; j++){
          if(this.listaUsuarios[j].uid == this.bloqueados[i]){
            this.listaUsuarios[j].bloqueado = true;
            this.listaBloqueados.push(this.listaUsuarios[j]);
          }
        }
      }
      this.actualizarListas();
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarProvincias(){
    this.provinciaService.cargarProvincias()
    .subscribe((res: any) => {
      this.listaProvincias = res['provincias'];
    }, (err: any) => {
      console.log(err);
    });
  }
  getProvincia(id: any, pos: number){
    for(let i = 0; i < this.listaProvincias.length; i++){
      if(this.listaProvincias[i].uid == id){
        this.listaUsuarios[pos].provincia = this.listaProvincias[i].nombre;
      }
    }
  }

  seguir(uid: any){
    console.log("seguir");
    this.usuarioService.seguirUsuario(this.idUsuario, uid)
    .subscribe((res: any) => {
      console.log(res);
      for(let i = 0; i < this.listaUsuarios.length; i++){
        if(this.listaUsuarios[i].uid == uid){
          if(this.listaUsuarios[i].seguido == true){
            this.listaUsuarios[i].seguido = false;
          }else{
            this.listaUsuarios[i].seguido = true;
          }
        }
      }
      this.cargarUsuario();
    }, (err: any) => {
      console.log(err);
    });
  }

  updateTexto(texto: string){
    this.filtrosForm.get('texto')?.setValue(texto);
    if(this.mostrarFiltros == false){
      this.cargarUsuarios();
    }
  }

  activarFiltros(){
    if(this.mostrarFiltros == false){
      this.mostrarFiltros = true;
      this.opcion = 0;
    }else{
      this.mostrarFiltros = false;
    }
  }

  desbloquear(id: any){
    this.usuarioService.bloquearUsuario(this.idUsuario, id)
    .subscribe((res: any) => {
      console.log(res);
      this.cargarUsuario();
      this.cargarUsuarios();
    }, (err: any) => {
      console.log(err);
    });
  }

  cambiar(opc: number){
    switch(opc){
      case 0:
        this.opcion = 0;
        break;
      case 1:
        this.opcion = 1;
        break;
      case 2:
        this.opcion = 2;
        break;
      case 3:
        this.opcion = 3;
        break;
    }
    this.cargarUsuarios();
  }

  guardar(){
    localStorage.setItem('before', `/usuarios/`);
  }

}
