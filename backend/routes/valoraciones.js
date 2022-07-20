const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerValoraciones, crearValoracion, borrarValoracion } = require('../controllers/valoraciones');
const router = Router();

router.get('/:id', [
    validarJWT,
    check('id', 'El id del usuario o la actividad debe ser válido').isMongoId(),
    validarCampos,
], obtenerValoraciones);

router.post('/', [
    check('usuario', 'El id del usuario debe ser válido').isMongoId(),
    check('actividad', 'El id de la actividad debe ser válido').isMongoId(),
    check('puntos', 'El argumento puntos debe ser válido').isNumeric({ min: 0, max: 5 }),
    check('comentario', 'El comentario es obligatorio').not().isEmpty().trim(),
    validarCampos,
    validarJWT
], crearValoracion);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarValoracion);

module.exports = router;