const { Schema, model, SchemaTypes } = require("mongoose");

const ActividadSchema = Schema({
    organizador: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    email: {
        type: String,
        required: false
    },
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    poblacion: {
        type: String,
        required: true
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: "Provincia"
    },
    min_participantes: {
        type: Number,
        required: true
    },
    max_participantes: {
        type: Number,
        required: true
    },
    num_participantes: {
        type: Number,
        default: 0
    },
    fotos: [{
        type: String
    }],
    precio: {
        type: Number,
        required: true,
        default: 0
    },
    requisitos: {
        type: String
    },
    participantes: [{
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }],
    // Valoraciones
    valoraciones: [{
        type: Schema.Types.ObjectId,
        ref: "Valoracion"
    }],
    puntuacion_media: {
        type: Number,
        default: 0
    },
    categorias: [{
        type: Schema.Types.ObjectId,
        ref: "Categoria",
        required: true
    }],
    participa: {
        type: Boolean,
        required: true
    }

}, { collection: "actividades" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
ActividadSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Actividad", ActividadSchema);