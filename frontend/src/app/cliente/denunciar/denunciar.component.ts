import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { IncidenciaService } from 'src/app/services/incidencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-denunciar',
  templateUrl: './denunciar.component.html',
  styleUrls: ['./denunciar.component.css']
})
export class DenunciarComponent implements OnInit {

  public denunciaForm = this.fb.group({
    denunciante: [''],
    denunciado: [''],
    motivo: ['']
  });
  public motivos = [
    {id: 1, nombre: "estafa", marcado: false},
    {id: 2, nombre: "acoso", marcado: false},
    {id: 3, nombre: "fotoInapropiada", marcado: false},
    {id: 4, nombre: "contenidoInapropiado", marcado: false}
  ];

  public valido = false;
  public alerta = false;
  public idUsuario: any;
  public idUsuarioLog: any;
  public usuario: any;
  public motivo: any;

  public waiting = false;

  constructor(private usuarioService: UsuarioService,
              private incidenciaService: IncidenciaService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.idUsuario = this.route.snapshot.params['uid'];
    this.cargarUsuario();
    this.cargarUsuarioLogueado();
    console.log(this.motivos);
  }

  cargarUsuario(){
    if(this.idUsuario !== ""){
      this.usuarioService.cargarUsuario(this.idUsuario)
      .subscribe( ( res: any) => {
        this.usuario = res['existeUsuario'];
        console.log(this.usuario);
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  cargarUsuarioLogueado(){
    let usuario = localStorage.getItem('email');
    if(!usuario){
      return;
    }
    this.usuarioService.cargarUsuario("", usuario)
    .subscribe((res: any) => {
      console.log(res);
      this.idUsuarioLog = res['existeUsuario'].uid;
    }, (err: any) => {
      console.log(err);
    });
  }

  seleccionar(id: any){
    for(let i = 0; i < this.motivos.length; i++){
      if(id == this.motivos[i].id){
        this.motivos[i].marcado = true;
        this.valido = true;
        if(this.alerta){
          this.alerta = false;
        }
      }else{
        this.motivos[i].marcado = false;
      }
    }
  }

  denunciar(){
    if(!this.valido){
      this.alerta = true;
    }else{
      this.denunciaForm.get('denunciante')?.setValue(this.idUsuarioLog);
    this.denunciaForm.get('denunciado')?.setValue(this.idUsuario);
    for(let i = 0; i < this.motivos.length; i++){
      if(this.motivos[i].marcado == true){
        this.denunciaForm.get('motivo')?.setValue(this.motivos[i].nombre);
      }
    }
    this.waiting = true;
    this.incidenciaService.denunciar(this.denunciaForm.value)
    .subscribe((res: any) => {
      console.log(res);
      this.waiting = false;
      Swal.fire({icon: 'success', title: 'Usuario denunciado', text: 'Muchas gracias, tu incidencia ya ha sido enviada'}).then((result)=>{
        if(result.value){
          this.router.navigateByUrl(`/usuarios/${this.idUsuario}`);
        }
      });
    }, (err: any) => {
      this.waiting = false;
      console.log(err);
    });
    }
  }
}
