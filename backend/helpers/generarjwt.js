const jwt = require("jsonwebtoken");

const generarJWT = (uid, rol) => {
    return new Promise((resolve, reject) => {
        const payload = {
            uid,
            rol
        };

        // Se firma el payload con la clave, durará el tiempo puesto en expirseIn,
        // y devolverá un error o el token
        jwt.sign(
            payload,
            process.env.JWTSECRET, {
                expiresIn: "1y",
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject("No se pudo generar el JWT");
                } else {
                    resolve(token);
                }
            }
        );
    });
};

module.exports = { generarJWT };