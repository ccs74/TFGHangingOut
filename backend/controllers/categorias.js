const Categoria = require('../models/categorias');

const obtenerCategorias = async(req, res) => {
    const id = req.query.id || "";
    const texto = req.query.texto;
    let textoBusqueda = "";
    if (texto) {
        textoBusqueda = new RegExp(texto, "i");
    }

    try {
        let categorias, total;
        if (id) {
            categorias = await Categoria.findById(id);
            if (!categorias) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe ninguna categoría con ese Id'
                });
            }
        } else {
            let query = {};
            if (texto) {
                query = { nombre: textoBusqueda };
            }
            [categorias, total] = await Promise.all([
                Categoria.find(query),
                Categoria.countDocuments(query),
            ]);
        }
        res.json({
            ok: true,
            msg: 'getCategorias',
            categorias
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener categorias'
        });
    }
}

const crearCategoria = async(req, res) => {
    const nombre = req.body.nombre;

    try {
        const existeCategoria = await Categoria.findOne({ nombre: nombre });
        if (existeCategoria) {
            return res.status(400).json({
                ok: false,
                msg: 'Categoria ya existe'
            });
        }

        const categoria = new Categoria(req.body);
        await categoria.save();

        res.json({
            ok: true,
            msg: 'crear Categoria',
            categoria
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear categoria'
        });
    }
}

const actualizarCategoria = async(req, res) => {
    const nombre = req.body.nombre;
    const uid = req.params.id;

    try {
        const existeCategoria = await Categoria.findById(uid);
        if (!existeCategoria) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la categoria",
            });
        }

        const categoria = await Categoria.findByIdAndUpdate(uid, { nombre }, { new: true });

        res.json({
            ok: true,
            msg: "Categoria actualizada correctamente",
            categoria
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error actualizando categoria",
        });
    }
}

const borrarCategoria = async(req, res) => {
    const uid = req.params.id;

    try {
        // Se comprueba si existe la categoria
        const existeCategoria = await Categoria.findById(uid);
        if (!existeCategoria) {
            return res.status(400).json({
                ok: true,
                msg: 'La categoria no existe'
            });
        }

        const resultado = await Categoria.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Categoria borrada correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando categoria",
        });
    }
}

module.exports = { obtenerCategorias, crearCategoria, actualizarCategoria, borrarCategoria }