const { Schema, model, SchemaTypes } = require("mongoose");

const ValoracionSchema = Schema({
    puntos: {
        type: Number,
        default: 0
    },
    comentario: {
        type: String,
        required: true
    },
    actividad: {
        type: Schema.Types.ObjectId,
        ref: "Actividad"
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }

}, { collection: "valoraciones" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
ValoracionSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Valoracion", ValoracionSchema);