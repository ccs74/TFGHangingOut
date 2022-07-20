const Usuario = require('../models/usuarios');
const Valoracion = require('../models/valoraciones');
const Actividad = require('../models/actividades');

const obtenerValoraciones = async(req, res) => {
    const id = req.params.id;

    try {
        const existeUsuario = await Usuario.findById(id);
        const existeActividad = await Actividad.findById(id);
        if (!existeActividad && !existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El id no es válido'
            });
        }
        let valoraciones, total;
        if (existeActividad) {
            valoraciones = await Valoracion.findOne({ actividad: id });
            total = 1;
        } else if (existeUsuario) {
            [valoraciones, total] = await Promise.all([
                Valoracion.find({ usuario: id }),
                Valoracion.countDocuments({ usuario: id }),
            ]);
        }

        res.json({
            ok: true,
            msg: 'getValoraciones',
            valoraciones,
            Total: total
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener valoraciones'
        });
    }
}

const crearValoracion = async(req, res) => {
    const usu = req.body.usuario;
    const act = req.body.actividad;

    try {
        const existeUsuario = await Usuario.findById(usu);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }
        const existeActividad = await Actividad.findById(act);
        if (!existeActividad) {
            return res.status(400).json({
                ok: false,
                msg: 'La actividad no existe'
            });
        }
        if (usu === existeActividad.organizador) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no puede valorar sus propias actividades'
            });
        }
        const existeValoracion = await Valoracion.findOne({ usuario: usu }, { actividad: act });
        if (existeValoracion) {
            return res.status(400).json({
                ok: false,
                msg: 'Solo puedes valorar una vez'
            });
        }
        let ha_participado = false;
        for (let i = 0; i < existeUsuario.actividades_asistidas.length; i++) {
            if (existeUsuario.actividades_asistidas[i].equals(act)) {
                ha_participado = true;
            }
        }
        if (!ha_participado) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no ha participado en esta actividad'
            });
        }
        let fechaActual = new Date();
        console.log(existeActividad.fecha);
        console.log(fechaActual);
        if (existeActividad.fecha.getTime() >= fechaActual.getTime()) {
            return res.status(400).json({
                ok: false,
                msg: 'Todavia no se puede valorar'
            });
        }
        const valoracion = new Valoracion(req.body);
        await valoracion.save();

        res.json({
            ok: true,
            msg: 'crear Valoracion',
            valoracion
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear valoracion'
        });
    }
}

const borrarValoracion = async(req, res) => {
    const uid = req.params.id;
    try {
        // Se comprueba si existe la provincia
        const existeValoracion = await Valoracion.findById(uid);
        if (!existeValoracion) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la valoracion",
            });
        }

        const resultado = await Valoracion.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Valoracion borrada correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando valoracion",
        });
    }
}

module.exports = { obtenerValoraciones, crearValoracion, borrarValoracion }