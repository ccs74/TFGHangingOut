const Provincia = require('../models/provincias');

const obtenerProvincias = async(req, res) => {
    const id = req.query.id || "";

    try {
        let provincias;
        if (id) {
            provincias = await Provincia.findById(id);
            if (!provincias) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe ninguna provincia con ese Id'
                });
            }
        } else {
            provincias = await Provincia.find();
        }
        res.json({
            ok: true,
            msg: 'getProvincias',
            provincias
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener provincias'
        });
    }
}

const crearProvincia = async(req, res) => {
    const nombre = req.body.nombre;

    try {
        const existeProvincia = await Provincia.findOne({ nombre: nombre });
        if (existeProvincia) {
            return res.status(400).json({
                ok: false,
                msg: 'Provincia ya existe'
            });
        }

        const provincia = new Provincia(req.body);
        await provincia.save();

        res.json({
            ok: true,
            msg: 'crear Provincia',
            provincia
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear provincia'
        });
    }
}

const actualizarProvincia = async(req, res) => {
    const nombre = req.body.nombre;
    const uid = req.params.id;

    try {
        const existeProvincia = await Provincia.findById(uid);
        if (!existeProvincia) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la provincia",
            });
        }

        const provincia = await Provincia.findByIdAndUpdate(uid, { nombre }, { new: true });

        res.json({
            ok: true,
            msg: "Provincia actualizada correctamente",
            provincia
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error actualizando provincia",
        });
    }
}

const borrarProvincia = async(req, res) => {
    const uid = req.params.id;
    try {
        // Se comprueba si existe la provincia
        const existeProvincia = await Provincia.findById(uid);
        if (!existeProvincia) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la provincia",
            });
        }

        const resultado = await Provincia.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Provincia borrada correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando provincia",
        });
    }
}

module.exports = { obtenerProvincias, crearProvincia, actualizarProvincia, borrarProvincia }