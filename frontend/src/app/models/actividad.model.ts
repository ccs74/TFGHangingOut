export class Actividad {

  constructor(
    public uid: string,
    public organizador: string,
    public titulo: string,
    public descripcion: string,
    public fecha: Date,
    public direccion: string,
    public poblacion: string,
    public provincia: string,
    public min_participantes: number,
    public max_participantes: number,
    public fotos: Array<string>,
    public precio: string,
    public requisitos: string,
    public participantes?: Array<string>,
    public valoraciones?: Array<string>,
    public puntuacion_media?: number,
    public categorias?: Array<string>,
    public participa?: boolean,
    public email?: string,
    public fecha2?: string,
    public num_participantes?: number,
    public foto?: string,
    public favorito?: boolean,
    public asistir?: boolean,
    public esCreador?: boolean,
    public completa?: boolean,
    public fechaValida?: boolean,
    public clase?: string
    ) {}
}
