export class Categoria {

  constructor(
    public uid: string,
    public nombre: string,
    public marcado: boolean = false,
    public clase?: string,
    ) {}
}
