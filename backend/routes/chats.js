const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerChats, obtenerChat, crearChat, actualizarChat, borrarChat, calcularDias, chatOActividad } = require('../controllers/chats');
const router = Router();

router.get('/:id', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerChats);

router.get('/tengo/chat/actividad/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').optional().isMongoId(),
    validarCampos,
], chatOActividad);

router.get('/:id1/:id2/:act', [
    validarJWT,
    check('id1', 'El id del usuario1 debe ser válido').isMongoId(),
    check('id2', 'El id del usuario2 debe ser válido').isMongoId(),
    check('act', 'El id de la actividad es obligatorio').not().isEmpty(),
    validarCampos
], obtenerChat);

router.get('/diferenciaDias/:fecha', [
    validarJWT,
    check('fecha', 'El argumento fecha no es válido').not().isEmpty(),
    validarCampos
], calcularDias);

router.post('/', [
    check('usuario1', 'El argumento usuario1 debe ser válido').isMongoId(),
    check('usuario2', 'El argumento usuario2 debe ser válido').isMongoId(),
    check('actividad', 'El argumento actividad debe ser válido').isMongoId(),
    validarCampos,
    validarJWT
], crearChat);

router.put('/:id', [
    check('id', 'El argumento id debe ser válido').isMongoId(),
    check('fecha', 'El argumento fecha debe ser válido').not().isEmpty().isDate(),
    validarCampos,
    validarJWT
], actualizarChat);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarChat);

module.exports = router;