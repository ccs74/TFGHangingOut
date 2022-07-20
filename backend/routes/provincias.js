const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerProvincias, crearProvincia, actualizarProvincia, borrarProvincia } = require('../controllers/provincias');
const router = Router();

router.get('/', [
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerProvincias);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWT
], crearProvincia);

router.put('/:id', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWT
], actualizarProvincia);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarProvincia);

module.exports = router;