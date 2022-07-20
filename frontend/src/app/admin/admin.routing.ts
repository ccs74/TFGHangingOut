
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { ActividadesComponent } from './actividades/actividades.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { CrearActividadComponent } from './crear-actividad/crear-actividad.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CrearCategoriaComponent } from './crear-categoria/crear-categoria.component';
import { IncidenciasComponent } from './incidencias/incidencias.component';
import { ResolverIncidenciaComponent } from './resolver-incidencia/resolver-incidencia.component';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import { VerActividadComponent } from './ver-actividad/ver-actividad.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';

const routes: Routes = [
  { path: 'admin', component: AdminLayoutComponent, //canActivate: [AuthGuard], data: { rol: ['ROL_ADMIN'] },
      children: [
        { path: 'usuarios',
          children: [
            { path: '', component: UsuariosComponent,   data: { rol: ['ROL_ADMIN'],
                                                        ruta: '/admin/usuarios',
                                                        titulo: 'Usuarios'}
            },
            { path: 'crear-usuario', component: CrearUsuarioComponent,  data: { rol: ['ROL_ADMIN'],
                                                                        ruta: 'admin/usuarios/crear-usuario',
                                                                        titulo: 'Crear Usuario'}
            },
            { path: 'editar-usuario/:uid', component: CrearUsuarioComponent, data: { rol: ['ROL_ADMIN'],
                                                                                      ruta: 'admin/usuarios/editar-usuario',
                                                                                      titulo: 'Editar Usuario'}
            },
            {
              path: 'ver-usuario/:uid', component: VerUsuarioComponent, data: { rol: ['ROL_ADMIN'],
                                                                                ruta: 'admin/usuarios/ver-usuario',
                                                                                titulo: 'Ver Usuario'}
            }
          ]
        },
        { path: 'actividades',
          children: [
            { path: '', component: ActividadesComponent, data: {  rol: ['ROL_ADMIN'],
                                                                  ruta: '/admin/actividades',
                                                                  titulo: 'Actividades'
                                                                }
            },
            { path: 'crear-actividad', component: CrearActividadComponent, data:  {  rol: ['ROL_ADMIN'],
                                                                                    ruta: 'admin/actividades/crear-actividad',
                                                                                    titulo: 'Crear Actividad'
                                                                                  }
            },
            { path: 'editar-actividad/:uid', component: CrearActividadComponent,  data: { rol: ['ROL_ADMIN'],
                                                                                  ruta: 'admin/actividades/editar-actividad',
                                                                                  titulo: 'Editar Actividad'}
            },
            { path: 'ver-actividad/:uid', component: VerActividadComponent, data: { rol: ['ROL_ADMIN'],
                                                                                    ruta: 'admin/actividades/ver-actividad/',
                                                                                    titulo: 'Ver Actividad'}
            }
          ]
        },
        { path: 'categorias',
          children: [
            { path: '', component: CategoriasComponent, data: {  rol: ['ROL_ADMIN'],
                                                                  ruta: '/admin/categorias',
                                                                  titulo: 'Categorias'
                                                                }
            },
            { path: 'crear-categoria', component: CrearCategoriaComponent, data:  {  rol: ['ROL_ADMIN'],
                                                                                    ruta: 'admin/categorias/crear-categoria',
                                                                                    titulo: 'Crear Categoria'
                                                                                  }
            },
            { path: 'editar-categoria/:uid', component: CrearCategoriaComponent,  data: { rol: ['ROL_ADMIN'],
                                                                                  ruta: 'admin/categorias/editar-categoria',
                                                                                  titulo: 'Editar Categoria'
                                                                                }
            }
          ]
        },
        { path: 'incidencias',
        children: [
          { path: '', component: IncidenciasComponent, data: {  rol: ['ROL_ADMIN'],
                                                                ruta: '/admin/incidencias',
                                                                titulo: 'Incidencias'
                                                              }
          },
          { path: 'resolver-incidencia/:uid', component: ResolverIncidenciaComponent, data:  {  rol: ['ROL_ADMIN'],
                                                                                  ruta: 'admin/incidencias/resolver-incidencia',
                                                                                  titulo: 'Resolver Incidencia'
                                                                                }
          }
        ]
      },
        { path: '**', redirectTo: 'usuarios' },
      ]
  },
];



@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
