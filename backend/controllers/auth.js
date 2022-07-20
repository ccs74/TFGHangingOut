const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const { generarJWT } = require('../helpers/generarjwt');
const { googleVerify } = require('../helpers/google-verify');

const login = async(req, res = response) => {
    const { email, password } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos",
                token: "",
            });
        }

        // Comprobar que la contraseña introducida es la misma que la que esta en la BD
        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos",
                token: "",
            });
        }

        const { _id, rol } = usuarioBD;
        // Devolverá el token, si no devolverá el reject de la promesa y saltará el catch del error
        const token = await generarJWT(_id, rol);

        res.json({
            ok: true,
            msg: "login",
            _id,
            rol,
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: "Error en el login",
            token: "",
        });
    }
}

const loginGoogle = async(req, res = response) => {
    const tokenGoogle = req.body.token;
    try {
        const { email, ...payload } = await googleVerify(tokenGoogle);

        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario incorrecto Identificación con Google",
                token: "",
            });
        }
        const { _id, rol } = usuarioBD;
        const token = await generarJWT(_id, rol);

        res.json({
            ok: true,
            msg: 'login google',
            uid: _id,
            rol,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "Error en el login Google",
            token: '',
        });
    }
}

const registroGoogle = async(req, res = response) => {
    const tokenGoogle = req.body.token;
    try {
        const { email, ...payload } = await googleVerify(tokenGoogle);
        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un usuario con ese email en la BBDD",
                token: "",
            });
        }

        const usuarioNuevo = new Usuario(req.body);
        const token = await generarJWT(usuarioNuevo._id, 'ROL_USUARIO');
        usuarioNuevo.token = token;
        usuarioNuevo.estado = "pendienteGoogle";
        await usuarioNuevo.save();
        res.json({
            ok: true,
            msg: 'registro google',
            token,
            usuario: usuarioNuevo
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: "Error en el registro con Google",
            token: '',
        });
    }
}
const activateUser = async(req, res = response) => {
    const token = req.params.token;
    try {
        var decoded = jwt_decode(token);
        const usuario = await Usuario.findById(decoded.uid);
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario no existe"
            });
        }
        const usu = await Usuario.findByIdAndUpdate(decoded.uid, { estado: "Activo" }, { new: true });
        res.json({
            ok: true,
            msg: 'Usuario activado',
            usu
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error activando Usuario"
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
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar contraseña',
        });
    }
}

const restablecerPassword = async(req, res = response) => {
    const email = req.body.email;
    const { newPassword, newPassword2 } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email: email });
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }
        if (newPassword !== newPassword2) {
            return res.status(400).json({
                ok: false,
                msg: 'Las contraseñas no coinciden',
            });
        }
        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(newPassword, salt);
        usuarioBD.password = cpassword;
        if (usuarioBD.estado === "pendienteGoogle") {
            usuarioBD.estado = "Activo";
        }
        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al restablecer contraseña',
        });
    }
}


const enviarEmail = async(req, res = response) => {
    const emailUsuario = req.body.email;
    const nombreUsu = req.body.nombre || "";
    const token = req.body.token || "";
    try {
        const nodemailer = require('nodemailer');
        let smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL, //'ccs74@gcloud.ua.es',
                pass: process.env.EMAILPASS //'oesghfolykfevnfc'
            }
        };
        let transporter = nodemailer.createTransport(smtpConfig);
        transporter.verify(function(error, success) {
            if (error) {
                console.error(error);
            } else {

            }
        });
        let mailOptions;

        let enlace = 'http://localhost:4200';
        if (process.env.NODE_ENV === 'produccion')
            enlace = 'https://';

        if (nombreUsu && token) {
            mailOptions = {
                from: nombreUsu + '", Bienvenid@ a Hanging Out" <ccs74@gcloud.ua.es>',
                to: emailUsuario,
                subject: 'Confirmación registro',
                html: `
                    <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                        <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">                            
                            <h1>¡Hola ${nombreUsu}!</h1>
                            <h2>Nos alegra que te hayas unido a Hanging Out.</h2>
                            <p>Por favor, pulsa en el siguiente botón para confirmar tu cuenta:</p>
                            <p><strong>Correo:</strong> ${emailUsuario}</p>
                            <a href="${enlace}/verification/${token}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> CONFIRMAR CORREO</a>
                        </div>
                    </div>`
            };
        } else {
            const existeUsuario = await Usuario.findOne({ email: emailUsuario });
            if (existeUsuario) {
                const nombre = existeUsuario.nombre_usuario;
                mailOptions = {
                    from: '"Recuperar Contraseña - Hanging Out" <ccs74@gcloud.ua.es>',
                    to: emailUsuario,
                    subject: 'Recuperar Contraseña',
                    html: `
                        <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                            <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">                                
                                <h1 style="color: white">¡Hola ${nombreUsu}!</h1>
                                <h2 style="color: white">¿Has olvidado tu contraseña? ¿Quieres crear una nueva?</h2>
                                <p style="color: white">Por favor, pulsa en el siguiente botón para restablecer tu contraseña:</p>
                                <a href="${enlace}/recovery/${emailUsuario}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> RESTABLECER CONTRASEÑA</a>
                            </div>
                        </div>`
                };
            }

        }

        await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
                return res.status(400).json({
                    ok: false,
                    msg: "Error enviando email"
                });
            } else {
                res.json({
                    ok: true,
                    msg: 'Email enviado',
                    info
                });
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error enviando email"
        });
    }
}

const reenviarEmail = async(req, res = response) => {
    const emailUsuario = req.params.email;
    try {
        const usuario = await Usuario.findOne({ email: emailUsuario });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un usuario con ese email"
            });
        }

        const token = await generarJWT(usuario._id, 'ROL_USUARIO');
        const nodemailer = require('nodemailer');
        let smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL, //'ccs74@gcloud.ua.es',
                pass: process.env.EMAILPASS //'dzocptimarhqajdw'
            }
        };
        let transporter = nodemailer.createTransport(smtpConfig);
        transporter.verify(function(error, success) {
            if (error) {
                console.error(error);
            } else {

            }
        });
        let enlace = 'http://localhost:4200';
        if (process.env.NODE_ENV === 'produccion') {
            enlace = 'https://';
        }
        let mailOptions = {
            from: usuario.nombre + '", Bienvenid@ a Hanging Out" <ccs74@gcloud.ua.es>',
            to: usuario.email,
            subject: 'Confirmación registro',
            html: `
                <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                    <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">
                        <h1>¡Hola ${usuario.nombre}!</h1>
                        <h2>Nos alegra que te hayas unido a Hanging Out.</h2>
                        <p>Por favor, pulsa en el siguiente botón para confirmar tu cuenta:</p>
                        <p><strong>Correo:</strong> ${usuario.email}</p>
                        <a href="${enlace}/verification/${token}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> CONFIRMAR CORREO</a>
                    </div>
                </div>`
        };

        await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
                return res.status(400).json({
                    ok: false,
                    msg: "Error enviando email :("
                });
            } else {
                res.json({
                    ok: true,
                    msg: 'Email enviado',
                    info
                });
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error enviando email"
        });
    }
}

module.exports = { login, loginGoogle, registroGoogle, activateUser, actualizarPassword, restablecerPassword, enviarEmail, reenviarEmail }