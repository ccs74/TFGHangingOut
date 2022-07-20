const { actualizarBD2 } = require('../helpers/actualizarbd');
const Actividad = require('../models/actividades');
const Categoria = require('../models/categorias');
const Usuario = require('../models/usuarios');
const { v4: uuidv4 } = require('uuid');
const { quitarTildes } = require('../helpers/quitarTildes');
const fs = require('fs');

const obtenerActividad = async(req, res = response) => {
    const id = req.params.id;
    try {
        const existeActividad = await Actividad.findById(id);
        const existeUsuario = await Usuario.findById(id);
        if (!existeActividad && !existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Error, el identificador no es válido'
            });
        }
        if (existeActividad) {
            res.json({
                ok: true,
                msg: "obtenerActividad",
                existeActividad
            });
        } else {
            [actividades, total] = await Promise.all([
                Actividad.find({ organizador: id }),
                Actividad.countDocuments({ organizador: id }),
            ]);
            res.json({
                ok: true,
                msg: "obtener actividades organizadas por un usuario",
                actividades
            });
        }

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener actividad'
        });
    }
}

const obtenerActividades = async(req, res = response) => {
    const texto = req.query.texto;
    let textoBusqueda = "";

    const lugar = req.query.lugar;
    let lugarBusqueda = "";

    const categorias = req.query.intereses;
    let categoriasBusqueda = [];

    const fecha = req.query.fecha;
    let fechaBusqueda = "";
    let fechaValida = false;
    let fecha2;
    let fechaValida2 = false;

    const domingo = req.query.domingo;

    const minimo = req.query.min;
    const maximo = req.query.max;

    const popularidad = req.query.ordenar;
    let ordenar = false;

    if (texto) {
        textoBusqueda = quitarTildes(texto.toString());
    }
    if (lugar) {
        lugarBusqueda = new RegExp(lugar, "i");
    }
    if (categorias) {
        let intereses = categorias.split(",");
        categoriasBusqueda = intereses.filter(e => e);
    }
    if (fecha) {
        fechaBusqueda = new RegExp(fecha, "i");
        validateDate = (date) => isNaN(Date.parse(date));
        fechaValida = validateDate(fechaBusqueda);
        let miFecha;
        if (domingo) {
            let fechaBusqueda2 = new RegExp(domingo, "i");
            fechaValida2 = validateDate(fechaBusqueda2);
            miFecha = new Date(domingo);
        } else {
            miFecha = new Date(fecha);
        }
        fecha2 = new Date(miFecha);
        fecha2.setDate(fecha2.getDate() + 1);
    }
    if (popularidad) {
        if (popularidad === "true") {
            ordenar = true;
        }
    }

    try {
        let actividades, total;
        let query = {};
        if (texto) {
            query.$or = [{ titulo: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }, { descripcion: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }];
            // query.$or = [{ titulo: textoBusqueda }, { descripcion: textoBusqueda }];
        }
        if (lugar) {
            query.$and = [{ poblacion: lugarBusqueda }];
        }
        if (categorias) {
            query.categorias = { $in: categoriasBusqueda };
        }
        if (fecha && fechaValida) {
            if (domingo) {
                if (fechaValida2) {
                    query.$and = [{ fecha: { $gte: new Date(fecha), $lte: new Date(fecha2) } }];
                }
            } else {
                query.$and = [{ fecha: { $gte: new Date(fecha), $lte: new Date(fecha2) } }];
            }

        }
        if (minimo && maximo) {
            query.$and = [{ precio: { $gte: minimo, $lte: maximo } }]
        } else {
            if (minimo) {
                query.$and = [{ precio: { $gte: minimo } }]
            }
            if (maximo) {
                query.$and = [{ precio: { $lte: maximo } }]
            }
        }
        if (popularidad && ordenar) {
            [actividades, total] = await Promise.all([
                Actividad.find(query).sort({ puntuacion_media: -1 }),
                Actividad.countDocuments(query),
            ]);
        } else {
            [actividades, total] = await Promise.all([
                Actividad.find(query),
                Actividad.countDocuments(query),
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerActividades",
            actividades,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las actividades'
        });
    }
}

const crearActividad = async(req, res = response) => {
    const organizador = req.body.organizador;
    const categorias = req.body.categorias;
    const participa = req.body.participa;
    try {
        // Crear perfil nuevo
        const existeUsuario = await Usuario.findById(organizador);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }
        for (let i = 0; i < categorias.length; i++) {
            const existeCategoria = await Categoria.findById(categorias[i]);
            if (!existeCategoria) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La categoria no existe'
                });
            }
        }
        if (participa) {
            req.body.num_participantes = 1;
        }
        req.body.email = existeUsuario.email;
        const nuevaActividad = new Actividad(req.body);
        await nuevaActividad.save();

        res.json({
            ok: true,
            msg: 'Actividad creada',
            actividad: nuevaActividad
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear actividad'
        });
    }
}

const actualizarActividad = async(req, res = response) => {
    const object = req.body;
    const uid = req.params.id;

    try {
        const existeActividad = await Actividad.findById(uid);
        if (!existeActividad) {
            return res.status(400).json({
                ok: false,
                msg: 'La actividad no existe'
            });
        }
        const existeUsuario = await Usuario.findById(req.body.organizador);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        } else {
            if (!existeUsuario._id.equals(existeActividad.organizador)) {
                req.params.organizador = existeActividad.organizador;
                return res.status(400).json({
                    ok: false,
                    msg: 'No puede cambiar el organizador de la actividad'
                });
            }
        }
        if (req.body.participa == true) {
            let marcada = false;
            for (let i = 0; i < existeUsuario.actividades_asistidas.length; i++) {
                if (existeUsuario.actividades_asistidas[i].equals(uid)) {
                    console.log("la actividad ya está marcada");
                    marcada = true;
                }
            }
            if (!marcada) {
                existeActividad.participantes.push(existeUsuario._id);
                await existeActividad.save();
                existeUsuario.actividades_asistidas.push(existeActividad);
                await existeUsuario.save();
            }
        } else {
            for (let i = 0; i < existeUsuario.actividades_asistidas.length; i++) {
                if (existeUsuario.actividades_asistidas[i].equals(uid)) {
                    existeUsuario.actividades_asistidas.splice(i, 1);
                    await existeUsuario.save();
                }
            }
            for (let i = 0; i < existeActividad.participantes.length; i++) {
                if (existeActividad.participantes[i].equals(existeUsuario._id)) {
                    existeActividad.participantes.splice(i, 1);
                    await existeActividad.save();
                }
            }
        }
        const actividad = await Actividad.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: "Actividad actualizada correctamente",
            actividad
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error actualizando actividad",
        });
    }
}

const guardarFav = async(req, res = response) => {
    const idUsuario = req.params.id;
    const idActividad = req.params.actividad;
    const add = req.params.fav;
    try {
        const existeUsuario = await Usuario.findById(idUsuario);
        if (!existeUsuario) {
            res.status(500).json({
                ok: false,
                msg: "El usuario no existe",
            });
        }
        const existeActividad = await Actividad.findById(idActividad);
        if (!existeActividad) {
            res.status(500).json({
                ok: false,
                msg: "La actividad no existe",
            });
        }
        if (existeActividad.organizador.equals(idUsuario)) {
            res.status(500).json({
                ok: false,
                msg: "El usuario organiza la actividad por lo que no puede guardar como favorito su propia actividad",
            });
        }
        let mssg = "";
        if (add === "true") {
            mssg = "Actividad marcada como favorito";
            for (let i = 0; i < existeUsuario.actividades_favoritas.length; i++) {
                if (existeUsuario.actividades_favoritas[i].equals(idActividad)) {
                    res.status(500).json({
                        ok: false,
                        msg: "Esta actividad ya está guardada como favorito",
                    });
                    return;
                }
            }
            console.log(existeUsuario.actividades_favoritas);
            existeUsuario.actividades_favoritas.push(existeActividad._id);
            await existeUsuario.save();
            res.json({
                ok: true,
                msg: mssg,
                existeUsuario
            });
        } else {
            for (let i = 0; i < existeUsuario.actividades_favoritas.length; i++) {
                if (existeUsuario.actividades_favoritas[i].equals(idActividad)) {
                    existeUsuario.actividades_favoritas.splice(i, 1);
                    await existeUsuario.save();

                }
            }
            mssg = "Actividad desmarcada como favorito";
            res.json({
                ok: true,
                msg: mssg,
                existeUsuario
            });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error marcando como favorito",
        });
    }
}

const asistir = async(req, res = response) => {
    const idUsuario = req.params.id;
    const idActividad = req.params.actividad;
    const asistir = req.params.asistir;
    try {
        const existeUsuario = await Usuario.findById(idUsuario);
        if (!existeUsuario) {
            res.status(500).json({
                ok: false,
                msg: "El usuario no existe",
            });
        }
        const existeActividad = await Actividad.findById(idActividad);
        if (!existeActividad) {
            res.status(500).json({
                ok: false,
                msg: "La actividad no existe",
            });
        }
        console.log(existeActividad.organizador);
        console.log(idUsuario);
        // if (existeActividad.organizador.equals(idUsuario)) {
        //     res.status(500).json({
        //         ok: false,
        //         msg: "Si el usuario quiere asistir a su propia activididad debe indicarlo al crear o editar la actividad",
        //     });
        // }
        let mssg = "";
        if (asistir === "true") {
            mssg = "Asistirá a la actividad";
            for (let i = 0; i < existeUsuario.actividades_asistidas.length; i++) {
                if (existeUsuario.actividades_asistidas[i].equals(idActividad)) {
                    res.status(500).json({
                        ok: false,
                        msg: "La actividad ya está marcada",
                    });
                }
            }
            existeActividad.participantes.push(idUsuario);
            existeActividad.num_participantes = existeActividad.num_participantes + 1;
            await existeActividad.save();
            existeUsuario.actividades_asistidas.push(existeActividad);
            await existeUsuario.save();
        } else {
            for (let i = 0; i < existeUsuario.actividades_asistidas.length; i++) {
                if (existeUsuario.actividades_asistidas[i].equals(idActividad)) {
                    existeUsuario.actividades_asistidas.splice(i, 1);
                    await existeUsuario.save();
                }
            }
            for (let i = 0; i < existeActividad.participantes.length; i++) {
                if (existeActividad.participantes[i].equals(idUsuario)) {
                    existeActividad.participantes.splice(i, 1);
                    existeActividad.num_participantes = existeActividad.num_participantes - 1;
                    await existeActividad.save();
                }
            }
            mssg = "No asistirá a la actividad";
        }
        res.json({
            ok: true,
            msg: mssg,
            existeUsuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error, no se puedo realizar la tarea marcar asistencia"
        });
    }
}

const borrarActividad = async(req, res = response) => {
    const uid = req.params.id;

    try {
        // Comprobamos si existe el perfil que queremos borrar
        const existeActividad = await Actividad.findById(uid);
        if (!existeActividad) {
            return res.status(400).json({
                ok: true,
                msg: 'La actividad no existe'
            });
        }
        // La eliminamos y devolvemos la actividad recien eliminada
        const resultado = await Actividad.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Actividad eliminada',
            resultado: resultado
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error borrando actividad'
        });
    }
}


const subirArchivos = async(req, res = response) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha subido ningun archivo'
            });
        }
        if (req.files.fotos.truncated) {
            return res.status(400).json({
                ok: false,
                msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}`,
            });
        }
        const id = req.params.id;
        let listaFotos;
        const activity = await Actividad.findById(id);
        if (activity) {
            listaFotos = activity.fotos;
        }
        //const nombrea = req.params.nombrearchivo;
        if (req.files.fotos.length) {
            for (let i = 0; i < req.files.fotos.length; i++) {
                const archivo = req.files.fotos[i];
                const partido = archivo.name.split('.');
                const extension = partido[partido.length - 1];
                const formatosPermitidos = ['jpeg', 'jpg', 'png', 'PNG'];
                if (!formatosPermitidos.includes(extension)) {
                    return res.status(400).json({
                        ok: false,
                        msg: `El tipo de archivo ${extension} no está permitido (${formatosPermitidos})`,
                    });
                }

                const nombreArchivo = `${uuidv4()}.${extension}`;
                //const nombreArchivo = `${nombrea}.${extension}`;
                let path = `../frontend/src/assets/imgs/actividades/${nombreArchivo}`;

                await archivo.mv(path, async(err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            ok: false,
                            msg: 'No se pudo cargar el archivo'
                        });
                    }
                });
                if (listaFotos[0] == "") {
                    listaFotos[0] = nombreArchivo;
                } else {
                    listaFotos.push(nombreArchivo);
                }
            }
        } else {
            const archivo = req.files.fotos;
            const partido = archivo.name.split('.');
            const extension = partido[partido.length - 1];
            const formatosPermitidos = ['jpeg', 'jpg', 'png', 'PNG'];
            if (!formatosPermitidos.includes(extension)) {
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo ${extension} no está permitido (${formatosPermitidos})`,
                });
            }

            const nombreArchivo = `${uuidv4()}.${extension}`;
            //const nombreArchivo = `${nombrea}.${extension}`;
            let path = `../frontend/src/assets/imgs/actividades/${nombreArchivo}`;

            await archivo.mv(path, async(err) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        ok: false,
                        msg: 'No se pudo cargar el archivo'
                    });
                }
            });
            if (listaFotos[0] == "") {
                listaFotos[0] = nombreArchivo;
            } else {
                listaFotos.push(nombreArchivo);
            }
        }
        res.json({
            ok: true,
            msg: 'Archivos subidos correctamente',
            listaFotos
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error subiendo archivo'
        });
    }
}

const borrarFotos = async(req, res = response) => {
    const id = req.params.id;
    console.log("borrar fotos");
    try {
        let path = `../frontend/src/assets/imgs/actividades/`;
        const actividad = await Actividad.findById(id);
        if (!actividad) {
            return res.status(400).json({
                ok: false,
                msg: 'La actividad no existe'
            });
        } else {
            if (actividad.fotos && actividad.fotos[0] !== "" && fs.existsSync(path + actividad.fotos[0])) {
                console.log("recorre las fotos");
                for (let i = 0; i < actividad.fotos.length; i++) {
                    let ruta = path + actividad.fotos[i];
                    fs.unlinkSync(ruta);
                }
                actividad.fotos = [];
                actividad.save();
            }
        }
        res.json({
            ok: true,
            msg: 'Archivos borrados correctamente'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando archivo'
        });
    }
}

module.exports = {
    obtenerActividad,
    obtenerActividades,
    crearActividad,
    actualizarActividad,
    guardarFav,
    asistir,
    borrarActividad,
    subirArchivos,
    borrarFotos
};