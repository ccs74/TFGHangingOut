const Usuario = require('../models/usuarios');
const bcrypt = require('bcryptjs');
const { actualizarBD } = require('../helpers/actualizarbd');
const { v4: uuidv4 } = require('uuid');
const actividades = require('../models/actividades');
const { findByIdAndUpdate } = require('../models/usuarios');
const { generarJWT } = require('../helpers/generarjwt');
const { quitarTildes } = require('../helpers/quitarTildes');

const getUsuario = async(req, res) => {
    const id = req.params.uid;
    const email = req.query.email;
    try {
        let existeUsuario, existeEmail;
        if (id && id !== "nose") {
            existeUsuario = await Usuario.findById(id);
        }
        if (email) {
            existeEmail = await Usuario.findOne({ email: email });
        }
        if (!existeUsuario && !existeEmail) {
            res.status(500).json({
                ok: false,
                msg: "No existe ningun usuario con ese id o email",
            });
        }
        if (!existeUsuario && existeEmail) {
            existeUsuario = existeEmail;
        }

        res.json({
            ok: true,
            msg: 'getUsuario',
            existeUsuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error obteniendo usuario",
        });
    }
}

const getUsuarios = async(req, res) => {
    //Comprobar que no estén bloqueados por el administrador
    const texto = req.query.texto;
    let textoBusqueda = "";

    const lugar = req.query.lugar;
    let lugarBusqueda = "";

    const minimo = req.query.min;
    const maximo = req.query.max;
    if (texto && texto !== "undefined") {
        textoBusqueda = quitarTildes(texto.toString());
    }
    if (lugar) {
        lugarBusqueda = new RegExp(lugar, "i");
    }
    //Milisegundos que tiene un year
    let year = 1000 * 60 * 60 * 24 * 265;
    try {
        let usuarios, total;
        let query = {};
        if (texto && textoBusqueda) {
            query.$or = [{ nombre: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }, { email: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }];
        }
        if (lugar) {
            query.$and = [{ poblacion: lugarBusqueda }];
        }
        let fecha = new Date();
        if (minimo && maximo) {
            let fecha1 = fecha.setFullYear(fecha.getFullYear() - minimo, fecha.getMonth(), fecha.getDate());
            fecha1 = new Date(fecha1);
            fecha = new Date();
            let fecha2 = fecha.setFullYear(fecha.getFullYear() - maximo, fecha.getMonth(), fecha.getDate());
            fecha2 = new Date(fecha2);
            query.$and = [{ fecha_nacimiento: { $gte: fecha2, $lte: fecha1 } }];
        } else {
            if (minimo) {
                let fecha1 = fecha.setFullYear(fecha.getFullYear() - minimo, fecha.getMonth(), fecha.getDate());
                fecha1 = new Date(fecha1);
                query.$and = [{ fecha_nacimiento: { $lte: fecha1 } }];
            }
            if (maximo) {
                let fecha2 = fecha.setFullYear(fecha.getFullYear() - maximo, fecha.getMonth(), fecha.getDate());
                fecha2 = new Date(fecha2);
                query.$and = [{ fecha_nacimiento: { $gte: fecha2 } }];
            }
        }
        [usuarios, total] = await Promise.all([
            Usuario.find(query),
            Usuario.countDocuments(query),
        ]);
        res.json({
            ok: true,
            msg: 'getUsuarios',
            usuarios
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error obteniendo usuarios",
        });
    }
}

const crearUsuario = async(req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        const exiteEmail = await Usuario.findOne({ email: email });
        if (exiteEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Las contraseñas no coinciden'
            });
        }

        // Encriptado de la contraseña
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        // Crear usuario nuevo
        const usuarioNuevo = new Usuario(req.body);
        usuarioNuevo.password = cpassword;
        await usuarioNuevo.save();
        const token = await generarJWT(usuarioNuevo._id, 'ROL_USUARIO');

        res.json({
            ok: true,
            msg: 'crearUsuario',
            usuarioNuevo,
            token: token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: "Error creando usuario",
        });
    }
}

const actualizarUsuario = async(req, res) => {
    const { password, email, ...datos } = req.body;
    const uid = req.params.id;
    try {
        // Comprobar si está intentando cambiar el email, que no coincida con alguno que ya esté en la BD
        // Obtenemos si hay un usuario en la BD con el email que nos llega en post
        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            // Si existe un usuario con ese email
            // Comprobamos que sea el suyo, el UID ha de ser igual, si no el email est en uso
            if (existeEmail._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: "Email ya existente",
                });
            }
        }

        datos.email = email;
        const usuario = await Usuario.findByIdAndUpdate(uid, datos, { new: true });

        res.json({
            ok: true,
            msg: "Usuario actualizado correctamente",
            usuario
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error actualizando usuario",
        });
    }
}

const seguir = async(req, res = response) => {
    const uid = req.params.id;
    const usuario = req.params.usuario;

    try {
        const existeUsu1 = await Usuario.findById(uid);
        const existeUsu2 = await Usuario.findById(usuario);
        if (!existeUsu1 || !existeUsu2) {
            res.status(500).json({
                ok: false,
                msg: "El id de algún usuario no es válido",
            });
        }
        let pos = -1;
        for (let i = 0; i < existeUsu1.siguiendo.length; i++) {
            if (existeUsu1.siguiendo[i].equals(usuario)) {
                pos = i;
            }
        }
        let mssg = "";
        if (pos === -1) {
            existeUsu1.siguiendo.push(usuario);
            await existeUsu1.save();
            mssg = "Usuario seguido";
        } else {
            existeUsu1.siguiendo.splice(pos, 1);
            await existeUsu1.save();
            mssg = "Usuario dejado de seguir";
        }
        res.json({
            ok: true,
            msg: mssg
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error: " + mssg + " no se puedo conseguir",
        });
    }
}

const bloquear = async(req, res = response) => {
    const uid = req.params.id;
    const usuario = req.params.usuario;

    try {
        const existeUsu1 = await Usuario.findById(uid);
        const existeUsu2 = await Usuario.findById(usuario);
        if (!existeUsu1 || !existeUsu2) {
            res.status(500).json({
                ok: false,
                msg: "El id de algún usuario no es válido",
            });
        }
        let mssg = "";
        if (existeUsu1.rol == "ROL_ADMIN") {
            if (!existeUsu2.bloqueado) {
                existeUsu2.bloqueado = true;
                mssg = "Usuario bloqueado por admin";
            } else {
                existeUsu2.bloqueado = false;
                mssg = "Usuario desbloqueado por admin";
            }
            await existeUsu2.save();
        } else {
            let pos = -1;
            for (let i = 0; i < existeUsu1.bloqueados.length; i++) {
                if (existeUsu1.bloqueados[i].equals(usuario)) {
                    pos = i;
                }
            }
            if (pos === -1) {
                existeUsu1.bloqueados.push(usuario);
                await existeUsu1.save();
                mssg = "Usuario bloqueado";
            } else {
                existeUsu1.bloqueados.splice(pos, 1);
                await existeUsu1.save();
                mssg = "Usuario desbloqueado";
            }
        }
        res.json({
            ok: true,
            msg: mssg
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error con la acción: " + mssg,
        });
    }
}

const borrarUsuario = async(req, res) => {
    const uid = req.params.id;

    try {
        // Se comprueba si el usuario existe
        const existeUsuario = await Usuario.findById(uid);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: true,
                msg: 'El usuario no existe'
            });
        }

        //Hay que borrar todas sus actividades

        const resultado = await Usuario.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Usuario borrado correctamente",
            resultado
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando usuario",
        });
    }
}

const actualizarPassword = async(req, res = response) => {
    const uid = req.params.id;
    const { password, newPassword, newPassword2 } = req.body;

    try {
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        // Se comprueba que el usuario sabe la contraseña vieja y que ha puesto 
        // dos veces la contraseña nueva
        if (newPassword !== newPassword2) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña repetida no coincide con la nueva contraseña',
            });
        }

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }
        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(newPassword, salt);
        usuarioBD.password = cpassword;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar contraseña',
        });
    }
}

const subirArchivo = async(req, res = response) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha subido el archivo'
            });
        }

        if (req.files.foto.truncated) {
            return res.status(400).json({
                ok: false,
                msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}`,
            });
        }
        const id = req.params.id;
        //const nombrea = req.params.nombrearchivo;
        const archivo = req.files.foto;
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
        let path = `../frontend/src/assets/imgs/usuarios/${nombreArchivo}`;

        archivo.mv(path, (err) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    ok: false,
                    msg: 'No se pudo cargar el archivo'
                });
            }

            actualizarBD(path, nombreArchivo, id)
                .then(valor => {
                    if (!valor) {
                        fs.unlinkSync(path);
                        return res.status(400).json({
                            ok: false,
                            msg: 'No se pudo actualizar BD'
                        });
                    } else {
                        res.json({
                            ok: true,
                            msg: 'Archivo subido correctamente',
                            nombreArchivo
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    fs.unlinkSync(path);
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al cargar archivo'
                    });
                });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error subiendo archivo'
        });
    }
}

const borrarFoto = async(req, res = response) => {
    const id = req.params.id;
    console.log("borrar foto");
    try {
        let path = `../frontend/src/assets/imgs/usuarios/`;

        const nombreArchivo = ``;
        actualizarBD(path, nombreArchivo, id)
            .then(valor => {
                if (!valor) {
                    fs.unlinkSync(path);
                    return res.status(400).json({
                        ok: false,
                        msg: 'No se pudo actualizar BD'
                    });
                } else {
                    res.json({
                        ok: true,
                        msg: 'Archivo borrado correctamente',
                        nombreArchivo
                    });
                }
            }).catch(error => {
                fs.unlinkSync(path);
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al cargar archivo'
                });
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando archivo'
        });
    }
}

const cambiarEstado = async(req, res = response) => {
    const id = req.params.id;
    try {
        const existeUsuario = await Usuario.findById(id);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }
        await findByIdAndUpdate(id, { firsTime: false }, { new: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error cambiando estado'
        });
    }
}

const getEdad = async(req, res = response) => {
    const id = req.params.uid;
    try {
        const existeUsuario = await Usuario.findById(id);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }

        let birthDate = new Date(existeUsuario.fecha_nacimiento);
        let currentDate = new Date();
        let diff = Math.abs(currentDate - birthDate);
        let result = Math.ceil((diff / (1000 * 3600 * 24)) / 365);
        res.json({
            ok: true,
            msg: 'Edad calculada correctamente',
            result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error calculando edad'
        });
    }
}

module.exports = { getUsuario, getUsuarios, crearUsuario, actualizarUsuario, seguir, bloquear, cambiarEstado, borrarUsuario, actualizarPassword, subirArchivo, borrarFoto, getEdad }