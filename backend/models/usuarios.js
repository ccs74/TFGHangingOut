const { Schema, model, SchemaTypes } = require("mongoose");

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fecha_nacimiento: {
        type: Date,
        required: true
    },
    rol: {
        type: String,
        required: true,
        default: "ROL_USUARIO",
    },
    pais: {
        type: String,
        required: true
    },
    poblacion: {
        type: String,
        required: true
    },
    provincia: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    foto: {
        type: String
    },
    estado: {
        type: String,
        required: true,
        default: 'Pendiente' //Activo
    },
    bloqueado: {
        type: Boolean,
        default: false
    },
    // Actividades
    actividades_favoritas: [{
        type: Schema.Types.ObjectId,
        ref: "Actividad"
    }],
    actividades_asistidas: [{
        type: Schema.Types.ObjectId,
        ref: "Actividad"
    }],
    //Chats
    chats: [{
        type: Schema.Types.ObjectId,
        ref: "Chat"
    }],
    //Otros usuarios
    siguiendo: [{
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }],
    bloqueados: [{
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }],
    //Categorias
    intereses: [{
        type: Schema.Types.ObjectId,
        ref: "Categoria"
    }],
    firstTime: {
        type: String,
        default: true
    }


}, { collection: "usuarios" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
UsuarioSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Usuario", UsuarioSchema);