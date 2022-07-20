export class Mensaje {

  constructor(
    public uid: string,
    public texto: string,
    public emisor: string,
    public receptor: string,
    public chat: string,
    public fecha: Date,
    public estado?: string,
    public hora?: string,
    public clase?: string
    ) {}
}
