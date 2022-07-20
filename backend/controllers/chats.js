const Chat = require('../models/chats');
const Actividad = require('../models/actividades');
const { response } = require('express');

const obtenerChats = async(req, res) => {
    const id = req.params.id;

    try {
        let chats;
        const existeChat = await Chat.findById(id);
        if (!existeChat) {
            let query = {};
            query.$or = [{ usuario1: id }, { usuario2: id }];
            chats = await Chat.find(query);
            if (!chats) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Este usuario no tienen ningun chat'
                });
            }
        } else {
            chats = existeChat;
        }

        res.json({
            ok: true,
            msg: 'getChats',
            chats
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener chats'
        });
    }
}

const obtenerChat = async(req, res) => {
    const id1 = req.params.id1;
    const id2 = req.params.id2;
    const act = req.params.act;
    try {
        let chat;
        const existeActividad = await Actividad.findById(act);
        if (!existeActividad) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna actividad con ese id'
            });
        }
        const existeChat1 = await Chat.findOne({ usuario1: id1, usuario2: id2, actividad: act });
        const existeChat2 = await Chat.findOne({ usuario1: id2, usuario2: id1, actividad: act });
        if (!existeChat1 && !existeChat2) {
            chat = "";
        } else {
            if (existeChat1) {
                chat = existeChat1;
            } else if (existeChat2) {
                chat = existeChat2;
            }
        }

        res.json({
            ok: true,
            msg: 'getChat',
            chat
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener chat'
        });
    }
}

const crearChat = async(req, res) => {
    const usu1 = req.body.usuario1;
    const usu2 = req.body.usuario2;
    const activity = req.body.actividad;

    try {
        //Comprobar que la actividad la organiza alguno de los usuarios pasados en el body :)
        const existeActividad = await Actividad.findById(activity);
        if (!existeActividad) {
            return res.status(400).json({
                ok: false,
                msg: 'La actividad no existe'
            });
        }
        if ((!existeActividad.organizador.equals(usu1)) && (!existeActividad.organizador.equals(usu2))) {
            return res.status(400).json({
                ok: false,
                msg: 'La actividad no la organiza ninguno de estos usuarios'
            });
        }
        let query = {};
        let query2 = {};
        query.$and = [{ usuario1: usu1 }, { usuario2: usu2 }, { actividad: activity }];
        query2.$and = [{ usuario: usu2 }, { usuario2: usu1 }, { actividad: activity }];
        const existeChat = await Chat.findOne(query);
        const existeChat2 = await Chat.findOne(query2);
        if (existeChat || existeChat2) {
            return res.status(400).json({
                ok: false,
                msg: 'Chat ya existe'
            });
        }

        const chat = new Chat(req.body);
        await chat.save();

        res.json({
            ok: true,
            msg: 'crear Chat',
            chat
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear chat'
        });
    }
}

//Se llamara desde el controllers/mensajes.js cuando se envie un mensaje :)S
const actualizarChat = async(req, res) => {
    const uid = req.params.id;
    const fecha = req.body.fecha;

    try {
        const existeChat = await Chat.findById(uid);
        if (!existeChat) {
            return res.status(400).json({
                ok: false,
                msg: 'Chat no existe'
            });
        }
        let fechaBusqueda = new RegExp(fecha, "i");
        let validateDate = (date) => isNaN(Date.parse(date));
        let fechaValida = validateDate(fechaBusqueda);
        if (!fechaValida) {
            return res.status(400).json({
                ok: false,
                msg: 'Fecha no valida'
            });
        }
        const chat = await Chat.findByIdAndUpdate(uid, { fecha_ultimoMensaje: fecha }, { new: true });

        res.json({
            ok: true,
            msg: "Chat actualizado correctamente",
            chat
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error actualizando chat",
        });
    }
}

const borrarChat = async(req, res) => {
    const uid = req.params.id;

    try {
        // Se comprueba si existe la categoria
        const existeChat = await Chat.findById(uid);
        if (!existeChat) {
            return res.status(400).json({
                ok: true,
                msg: 'El chat no existe'
            });
        }
        const resultado = await Chat.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Chat borrado correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando chat",
        });
    }
}

const calcularDias = async(req, res) => {
    const fecha = req.params.fecha;

    try {
        let fechaValida;
        let resultado = 0;
        if (fecha) {
            let fechaBusqueda = new RegExp(fecha, "i");
            validateDate = (date) => isNaN(Date.parse(date));
            fechaValida = validateDate(fechaBusqueda);
        }
        if (fecha && fechaValida) {
            let miFecha = new Date(fecha);
            let fechaActual = new Date();
            let diff = fechaActual - miFecha;
            resultado = Math.round(diff / (1000 * 60 * 60 * 24));
        }


        res.json({
            ok: true,
            msg: "Diferencia de dias",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error calculando la diferencia de dias",
        });
    }
}

const chatOActividad = async(req, res = response) => {
    const id = req.params.id;
    try {
        const existeChat = await Chat.findById(id);
        const existeActividad = await Actividad.findById(id);
        if (!existeChat && !existeActividad) {
            return res.status(400).json({
                ok: true,
                msg: 'Identificador inválido'
            });
        }
        let mssg = "";
        let resultado;
        if (existeChat) {
            mssg = "Es un chat";
            resultado = existeChat;
        } else {
            mssg = "Es una actividad";
            resultado = existeActividad;
        }
        res.json({
            ok: true,
            msg: mssg,
            resultado
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error obteniendo chat o actividad",
        });
    }
}



module.exports = { obtenerChats, obtenerChat, crearChat, actualizarChat, borrarChat, calcularDias, chatOActividad }