const { response } = require("express");
const motivosPermitidos = ["estafa", "acoso", "fotoInapropiada", "contenidoInapropiado"];

const validarMotivo = (req, res = response, next) => {
    const { motivo } = req.body;

    if (motivo && !motivosPermitidos.includes(motivo)) {
        return res.status(400).json({
            ok: false,
            msg: "Motivo incorrecto",
        });
    }
    next();
};

module.exports = { validarMotivo };