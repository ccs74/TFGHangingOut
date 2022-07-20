const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerMensajes, enviarMensaje, borrarMensaje } = require('../controllers/mensajes');
const router = Router();

router.get('/:id/:usuario', [
    validarJWT,
    check('id', 'El id del chat debe ser válido').isMongoId(),
    check('usuario', 'El usuario debe ser válido').isMongoId(),
    validarCampos,
], obtenerMensajes);

router.post('/:id', [
    check('id', 'El id del chat debe ser válido').isMongoId(),
    check('emisor', 'El argumento emisor debe ser válido').isMongoId(),
    check('receptor', 'El argumento receptor debe ser válido').isMongoId(),
    check('texto', 'El texto es obligatorio').not().isEmpty().trim(),
    validarCampos,
    validarJWT
], enviarMensaje);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarMensaje);

module.exports = router;