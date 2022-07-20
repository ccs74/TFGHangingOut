export class Chat {

  constructor(
    public uid: string,
    public usuario1: string,
    public usuario2: string,
    public actividad: string,
    public fecha_ultimoMensaje: Date,
    public receptor?: string,
    public titulo?: string,
    public fecha?: string,
    public dias?: number,
    public fotoUsuario?: string,
    public fotoActividad?: string
    ) {}
}
