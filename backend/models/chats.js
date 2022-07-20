const { Schema, model, SchemaTypes } = require("mongoose");

const ChatSchema = Schema({
    usuario1: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    usuario2: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    actividad: {
        type: Schema.Types.ObjectId,
        ref: "Actividad"
    },
    fecha_ultimoMensaje: {
        type: Date
    }

}, { collection: "chats" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
ChatSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Chat", ChatSchema);