const { Router } = require('express');
const { login, actualizarPassword, restablecerPassword, loginGoogle, registroGoogle, activateUser, enviarEmail, reenviarEmail } = require('../controllers/auth');
const { check } = require("express-validator");
const { validarCampos } = require('../middleware/validar-campos');
const router = Router();
const { validarJWT } = require('../middleware/validar-jwt');

router.post('/', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], login);

router.put('/password/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('newPassword', 'El argumento nuevopassword es obligatorio').not().isEmpty().trim(),
    check('newPassword2', 'El argumento nuevopassword2 es obligatorio').not().isEmpty().trim(),
    validarCampos,
], actualizarPassword);

router.put('/changePassword', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('newPassword', 'El argumento newPassword es obligatorio').not().isEmpty().trim(),
    check('newPassword2', 'El argumento newPassword2 es obligatorio').not().isEmpty().trim(),
    validarCampos,
], restablecerPassword);

router.post("/google", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    validarCampos,
], loginGoogle);

router.post("/enviar/email", [
    validarCampos
], enviarEmail);

router.post("/reenviar/:email", [
    validarCampos,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail()
], reenviarEmail);

router.post("/google2", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    check('nombre_usuario', 'El argumento nombre_usuario es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], registroGoogle);

router.put("/activateUser/:token", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    validarCampos
], activateUser);

module.exports = router;