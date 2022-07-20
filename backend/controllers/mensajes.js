const Chat = require('../models/chats');
const Mensaje = require('../models/mensajes');

const obtenerMensajes = async(req, res) => {
    const id = req.params.id;
    const usu = req.params.usuario;
    try {
        let query = {};
        //no funciona
        query.$or = [{ emisor: usu }, { receptor: usu }];
        query.$and = [{ chat: id }];
        const mensajes = await Mensaje.find(query);
        if (!mensajes) {
            return res.status(400).json({
                ok: false,
                msg: 'Este usuario no tienen ningun mensaje'
            });
        }
        res.json({
            ok: true,
            msg: 'getMensajes',
            mensajes
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener mensajes'
        });
    }
}

const enviarMensaje = async(req, res) => {
    const uid = req.params.id;
    const emisor = req.body.emisor;
    const receptor = req.body.receptor;

    try {
        const existeChat = await Chat.findById(uid);
        if (!existeChat) {
            return res.status(400).json({
                ok: false,
                msg: 'El chat no existe'
            });
        }
        let fecha = new Date();
        req.body.fecha = fecha;
        if ((existeChat.usuario1.equals(emisor) && existeChat.usuario2.equals(receptor)) || (existeChat.usuario1.equals(receptor) && existeChat.usuario2.equals(emisor))) {

        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Los usuarios no pertenecen a este chat'
            });
        }
        req.body.chat = uid;
        const mensaje = new Mensaje(req.body);
        await mensaje.save();

        const result = await Chat.findByIdAndUpdate(uid, { fecha_ultimoMensaje: fecha }, { new: true });

        res.json({
            ok: true,
            msg: 'crear Mensaje',
            mensaje
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear mensaje'
        });
    }
}

const borrarMensaje = async(req, res) => {
    const uid = req.params.id;

    try {
        // Se comprueba si existe la categoria
        const existeMensaje = await Mensaje.findById(uid);
        if (!existeMensaje) {
            return res.status(400).json({
                ok: true,
                msg: 'El mensaje no existe'
            });
        }
        const resultado = await Mensaje.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Mensaje borrado correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando mensaje",
        });
    }
}

module.exports = { obtenerMensajes, enviarMensaje, borrarMensaje }