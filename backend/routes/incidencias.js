const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerIncidencias, denunciar, actualizarIncidencia, borrarIncidencia } = require('../controllers/incidencias');
const { validarMotivo } = require('../middleware/validar-motivo');
const router = Router();

router.get('/', [
    validarJWT,
    check('texto', 'El arguemtno texto debe ser válido').optional().trim(),
    validarCampos,
], obtenerIncidencias);

router.post('/', [
    check('denunciante', 'El argumento denunciante debe ser válido').isMongoId(),
    check('denunciado', 'El argumento denunciado debe ser válido').isMongoId(),
    check('motivo', 'El argumento motivo es obligatorio').not().isEmpty().trim(),
    validarMotivo,
    validarCampos,
    validarJWT
], denunciar);

router.put('/:id/:sol', [
    check('id', 'El argumento id debe ser válido').isMongoId(),
    check('sol', 'El argumento sol es obligatorio').not().isEmpty().trim(),
    validarCampos,
    validarJWT
], actualizarIncidencia);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarIncidencia);

module.exports = router;