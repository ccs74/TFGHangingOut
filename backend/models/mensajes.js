const { Schema, model, SchemaTypes } = require("mongoose");

const MensajeSchema = Schema({
    texto: {
        type: String,
        required: true
    },
    emisor: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    receptor: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat"
    },
    fecha: {
        type: Date
    },
    estado: {
        type: String,
        default: "Pendiente" //Enviado / Visto
    }

}, { collection: "mensajes" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
MensajeSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Mensaje", MensajeSchema);