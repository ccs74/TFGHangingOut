const Usuario = require('../models/usuarios');
const Actividad = require('../models/actividades');
const fs = require('fs');

const actualizarBD = async(path, nombreArchivo, id) => {

    const usuario = await Usuario.findById(id);

    if (!usuario) {
        return false;
    }

    if (usuario) {
        const fotoVieja = usuario.foto;
        let pathFotoVieja = `../frontend/src/assets/imgs/usuarios/${fotoVieja}`;

        if (fotoVieja && fotoVieja !== "" && fs.existsSync(pathFotoVieja)) {
            fs.unlinkSync(pathFotoVieja);
        }
        usuario.foto = nombreArchivo;
        await usuario.save();

        return true;
    }
}

const actualizarBD2 = async(path, nombreArchivo, id) => {
    const actividad = await Actividad.findById(id);

    if (!actividad) {
        return false;
    }

    if (actividad) {
        // const fotoVieja = actividad.fotos;
        // let pathFotoVieja = `../frontend/src/assets/imgs/actividades/${fotoVieja}`;

        // if (fotoVieja && fotoVieja !== "" && fs.existsSync(pathFotoVieja)) {
        //     fs.unlinkSync(pathFotoVieja);
        // }
        actividad.fotos.push(nombreArchivo);
        await actividad.save();

        return true;
    }
}

module.exports = { actualizarBD, actualizarBD2 }