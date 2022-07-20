const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { obtenerActividades, obtenerActividad, crearActividad, actualizarActividad, guardarFav, asistir, borrarActividad, subirArchivos, borrarFotos } = require('../controllers/actividades');
const router = Router();

router.get('/', [validarJWT], obtenerActividades);

router.get('/:id', [
    validarJWT,
    check('id', 'El id del usuario o la actividad debe ser válido').isMongoId(),
    validarCampos,
], obtenerActividad);

router.post('/', [
    check('titulo', 'El argumento titulo es obligatorio').not().isEmpty(),
    check('organizador', 'El argumento organizador no es válido').isMongoId(),
    check('descripcion', 'El argumento descripcion es obligatorio').not().isEmpty(),
    check('direccion', 'El argumento email es obligatorio').not().isEmpty(),
    check('min_participantes', 'El argumento min_participantes no es válido').optional().isNumeric({ min: 0 }),
    check('max_participantes', 'El argumento max_participantes no es válido').optional().isNumeric({ min: 1 }),
    check('fecha', 'El argumento fecha es obligatorio').not().isEmpty().trim(),
    check('provincia', 'El argumento provincia no es valido').not().isEmpty(),
    check('poblacion', 'El argumento poblacion no es valido').not().isEmpty(),
    check('precio', 'El argumento precio no es valido').optional().isFloat(),
    check('participa', 'El argumento participa es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWT
], crearActividad);

router.put('/:id', [
    check('id', 'El id de la actividad debe ser válido').isMongoId(),
    check('titulo', 'El argumento titulo es obligatorio').not().isEmpty(),
    check('descripcion', 'El argumento descripcion es obligatorio').not().isEmpty(),
    check('direccion', 'El argumento email es obligatorio').not().isEmpty(),
    check('participantes', 'El argumento participantes es obligatorio y debe ser un número').optional().isEmpty().isNumeric(),
    check('min_participantes', 'El argumento min_participantes no es válido').optional().isNumeric({ min: 0 }),
    check('max_participantes', 'El argumento max_participantes no es válido').optional().isNumeric({ min: 1 }),
    check('fecha', 'El argumento fecha es obligatorio').not().isEmpty().trim(),
    check('provincia', 'El argumento provincia no es valido').not().isEmpty(),
    check('poblacion', 'El argumento poblacion no es valido').not().isEmpty(),
    check('precio', 'El argumento precio no es valido').optional().isFloat(),
    validarCampos,
    validarJWT
], actualizarActividad);

router.put('/:id/:actividad/:fav', [
    check('id', 'El id del usuario debe ser válido').isMongoId(),
    check('actividad', 'El id de la actividad debe ser válido').isMongoId(),
    check('fav', 'El argumento fav es obligatorio').isBoolean(),
    validarCampos,
    validarJWT
], guardarFav);

router.put('/:id/:actividad/marcar/asistencia/:asistir', [
    check('id', 'El id del usuario debe ser válido').isMongoId(),
    check('actividad', 'El id de la actividad debe ser válido').isMongoId(),
    check('asistir', 'El argumento asistir es obligatorio').isBoolean(),
    validarCampos,
    validarJWT
], asistir);

router.put('/subir/imagenes/actividad/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], subirArchivos);

router.delete('/fotos/:id', [
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
    validarJWT
], borrarFotos);

router.delete('/:id', [
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
    validarJWT
], borrarActividad);

module.exports = router;