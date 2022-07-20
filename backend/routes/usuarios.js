const { Router } = require('express');
const { validarCampos } = require('../middleware/validar-campos');
const { validarRol } = require('../middleware/validar-rol');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require("express-validator");
const { getUsuario, getUsuarios, crearUsuario, actualizarUsuario, seguir, bloquear, borrarUsuario, cambiarEstado, actualizarPassword, subirArchivo, borrarFoto, getEdad } = require('../controllers/usuarios');
const router = Router();

router.get('/:uid', [
    validarCampos,
    validarJWT
], getUsuario);

router.get('/', [validarJWT], getUsuarios);

router.get('/edad/:uid', [
    validarCampos,
    check('uid', 'El campo uid no es válido').isMongoId(),
    validarJWT
], getEdad);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('confirmPassword', 'El argumento Confirmar password es obligatorio').not().isEmpty(),
    check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().trim(),
    check('pais', 'El argumento pais no es valido').not().isEmpty(),
    check('provincia', 'El argumento provincia no es valido').not().isEmpty(),
    check('poblacion', 'El argumento poblacion no es valido').not().isEmpty(),
    check('descripcion', 'El argumento descripcion no es valido').not().isEmpty(),
    validarCampos
], crearUsuario);

router.put('/:id', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().trim(),
    check('id', 'El identificador no es válido').isMongoId(),
    check('pais', 'El argumento pais no es valido').not().isEmpty(),
    check('provincia', 'El argumento provincia no es valido').not().isEmpty(),
    check('poblacion', 'El argumento poblacion no es valido').not().isEmpty(),
    check('descripcion', 'El argumento descripcion no es valido').not().isEmpty(),
    validarRol,
    validarCampos,
    validarJWT
], actualizarUsuario);

router.put('/:id/:usuario', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('usuario', 'El identificador usuario no es válido').isMongoId(),
    validarCampos,
], seguir);

router.put('/bloquear/:id/:usuario', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('usuario', 'El identificador usuario no es válido').isMongoId(),
    validarCampos,
], bloquear);

router.put('/password/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('newPassword', 'El argumento nuevopassword es obligatorio').not().isEmpty().trim(),
    check('newPassword2', 'El argumento nuevopassword2 es obligatorio').not().isEmpty().trim(),
    validarCampos,
], actualizarPassword);

router.put('cambiarEstado/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], cambiarEstado);

router.delete('/imagen/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], borrarFoto);

router.put('/subir/imagen/perfil/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], subirArchivo);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarUsuario);



module.exports = router;