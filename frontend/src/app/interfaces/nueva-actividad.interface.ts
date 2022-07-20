export interface nuevaActividadForm {
  titulo: string;
  descripcion: string;
  requisitos: string;
  precio: number;
  min_participantes: number;
  max_participantes: number;
  fecha: Date;
  pais: string;
  poblacion: string;
  provincia: string;
  direccion: string;
  categorias: Array<string>;
  participa: boolean;
}
