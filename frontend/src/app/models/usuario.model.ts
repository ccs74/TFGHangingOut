export class Usuario {

  constructor(
    public uid: string,
    public rol: string,
    public nombre?: string,
    public apellidos?: string,
    public email?: string,
    public perfiles?: any[],
    public password?: string,
    public fecha_nacimiento?: Date,
    public pais?: string,
    public provincia?: string,
    public poblacion?: string,
    public descripcion?: string,
    public estado?: string,
    public bloqueado?: boolean,
    public seguido?: boolean,
    public foto?: string
    ) {}
}
