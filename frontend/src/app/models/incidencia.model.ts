export class Incidencia {

  constructor(
    public uid: string,
    public denunciante: string,
    public denunciado: string,
    public motivo: string,
    public estado: string,
    public fecha: Date,
    public solucion: string,
    public fecha2?: string,
    public motivo2?: string,
    public emailDenunciante?: string,
    public emailDenunciado?: string,
    ) {}
}
