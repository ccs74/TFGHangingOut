import { Component, OnInit } from '@angular/core';
import { IncidenciaService } from 'src/app/services/incidencia.service';
import { Incidencia } from 'src/app/models/incidencia.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})
export class IncidenciasComponent implements OnInit {

  public listaIncidencias: Incidencia[] = [];
  public pendientes: Incidencia[] = [];
  public resueltas: Incidencia[] = [];
  public opcion: number = 1;

  constructor(private incidenciaService: IncidenciaService,
              private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  actualizarIncidencias(){
    this.pendientes= [];
    this.resueltas = [];
    for(let i = 0; i < this.listaIncidencias.length; i++){
      if(this.listaIncidencias[i].estado == "Pendiente"){
        this.pendientes.push(this.listaIncidencias[i]);
      }else{
        this.resueltas.push(this.listaIncidencias[i]);
      }
    }
  }

  cargarIncidencias(){
    this.incidenciaService.cargarIncidencias()
    .subscribe((res: any) => {
      this.listaIncidencias = res['incidencias'];
      for(let i = 0; i < this.listaIncidencias.length; i++){
        this.convertirFecha(this.listaIncidencias[i].fecha, i);
        this.convertirMotivo(this.listaIncidencias[i].motivo, i);
        this.cargarUsuario(this.listaIncidencias[i].denunciado, i, 1);
        this.cargarUsuario(this.listaIncidencias[i].denunciante, i, 2);
      }
      this.actualizarIncidencias();
    }, (err: any) => {
      console.log(err);
    });
  }

  cargarUsuario(id: string, pos: number, user: number){
    this.usuarioService.cargarUsuario(id)
    .subscribe((res: any) => {
      switch(user){
        case 1:
          this.listaIncidencias[pos].emailDenunciado = res['existeUsuario'].email;
          break;
        case 2:
          this.listaIncidencias[pos].emailDenunciante = res['existeUsuario'].email;
          break;
      }
    }, (err: any) =>  {
      console.log(err);
    });
  }

  convertirFecha(fecha: Date, pos: number){
    let date = new Date(fecha);
    let d, m, dia, mes, anyo;
    d = date.getDate();
    if(d < 10){
      dia = "0" + d.toString();
    }else{
      dia = d.toString();
    }
    m = date.getMonth() + 1;
    if(m < 10){
      mes = "0" + m.toString();
    }else{
      mes = m.toString();
    }
    anyo = date.getFullYear().toString();
    let cadena = dia + "-" + mes + "-" + anyo;
    this.listaIncidencias[pos].fecha2 = cadena;
  }

  convertirMotivo(motivo: string, pos: number){
    switch(motivo){
      case "estafa":
        this.listaIncidencias[pos].motivo2 = "Estafa";
        break;
      case "acoso":
        this.listaIncidencias[pos].motivo2 = "Acoso";
        break;
      case "contenidoInapropiado":
        this.listaIncidencias[pos].motivo2 = "Contenido Inapropiado";
        break;
    }
  }

  cambiarOpcion(opc: number){
    switch(opc){
      case 1:
        this.opcion = 1;
        break;
      case 2:
        this.opcion = 2;
        break;
    }
  }

  setBefore(){
    localStorage.setItem('before', '/admin/incidencias');
  }

  logout(): void {
    this.usuarioService.logout();
  }
}
