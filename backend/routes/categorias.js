const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerCategorias, crearCategoria, actualizarCategoria, borrarCategoria } = require('../controllers/categorias');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerCategorias);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWT
], crearCategoria);

router.put('/:id', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWT
], actualizarCategoria);

router.delete('/:id', [
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
    validarJWT
], borrarCategoria);

module.exports = router;