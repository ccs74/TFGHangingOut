const { Schema, model, SchemaTypes } = require("mongoose");

const IncidenciaSchema = Schema({
    denunciante: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    denunciado: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    motivo: {
        type: String,
        required: true,
    },
    estado: {
        type: String,
        default: 'Pendiente' //Resuelta
    },
    fecha: {
        type: Date
    },
    solucion: {
        type: String
    }

}, { collection: "incidencias" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
IncidenciaSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Incidencia", IncidenciaSchema);