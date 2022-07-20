const Usuario = require('../models/usuarios');
const Incidencia = require('../models/incidencias');

const obtenerIncidencias = async(req, res) => {
    const texto = req.query.texto;
    const id = req.query.id;
    console.log(id);
    let txt = "";
    if (texto) {
        txt = new RegExp(texto, "i");
    }
    try {
        let incidencias, total;
        if (id) {
            incidencias = await Incidencia.findById(id);
            const existeUsuario = await Usuario.findById(id);
            if (!incidencias && !existeUsuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe ninguna incidencia ni usuario con ese Id'
                });
            }
            if (existeUsuario) {
                let query = {};
                query.$or = [{ denunciante: id }, { denunciado: id }];
                [incidencias, total] = await Promise.all([
                    Incidencia.find(query).sort({ fecha: 1 }),
                    Incidencia.countDocuments(query),
                ]);
            }
        } else {
            let query = {};
            if (texto) {
                query.$or = [{ denunciante: txt }, { denunciado: txt }, { motivo: txt }];
            }

            [incidencias, total] = await Promise.all([
                Incidencia.find(query).sort({ fecha: 1 }),
                Incidencia.countDocuments(query),
            ]);
        }

        res.json({
            ok: true,
            msg: 'getIncidencias',
            incidencias
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener incidencias'
        });
    }
}

const denunciar = async(req, res) => {
    const denunciante = req.body.denunciante;
    const denunciado = req.body.denunciado;

    try {
        //Comprobar que la actividad la organiza alguno de los usuarios pasados en el body :)
        const existeUsuario1 = await Usuario.findById(denunciante);
        const existeUsuario2 = await Usuario.findById(denunciado);
        if (!existeUsuario1 || !existeUsuario2) {
            return res.status(400).json({
                ok: false,
                msg: 'Alguno de los usuarios no existe'
            });
        }
        let fecha = new Date();
        req.body.fecha = fecha;

        const denuncia = new Incidencia(req.body);
        await denuncia.save();

        res.json({
            ok: true,
            msg: 'denuncia',
            denuncia
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al denunciar'
        });
    }
}

//Se llamara desde el controllers/mensajes.js cuando se envie un mensaje :)S
const actualizarIncidencia = async(req, res) => {
    const id = req.params.id;
    const solucion = req.params.sol;

    try {
        const existeIncidencia = await Incidencia.findById(id);
        if (!existeIncidencia) {
            return res.status(400).json({
                ok: false,
                msg: 'La incidencia no existe'
            });
        }
        let incidencia;
        if (solucion === "denegar") {
            incidencia = await Incidencia.findByIdAndUpdate(id, { estado: "Resuelta", solucion: "Denegada" }, { new: true });
        } else if (solucion === "bloquear") {
            const usuario = await Usuario.findById(existeIncidencia.denunciado);
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El usuario no existe'
                });
            }
            usuario.bloqueado = true;
            await usuario.save();
            incidencia = await Incidencia.findByIdAndUpdate(id, { estado: "Resuelta", solucion: "Usuario bloqueado" }, { new: true });
        }

        res.json({
            ok: true,
            msg: "Incidencia resuelta correctamente",
            incidencia
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error resolviendo incidencia",
        });
    }
}

const borrarIncidencia = async(req, res) => {
    const uid = req.params.id;

    try {
        // Se comprueba si existe la categoria
        const existeIncidencia = await Incidencia.findById(uid);
        if (!existeIncidencia) {
            return res.status(400).json({
                ok: true,
                msg: 'La incidencia no existe'
            });
        }
        const resultado = await Incidencia.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Incidencia borrada correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando incidencia",
        });
    }
}

module.exports = { obtenerIncidencias, denunciar, actualizarIncidencia, borrarIncidencia }