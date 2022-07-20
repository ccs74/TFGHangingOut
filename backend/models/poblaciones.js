const { Schema, model, SchemaTypes } = require("mongoose");

const PoblacionSchema = Schema({
    nombre: {
        type: string,
        required: true
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: "Provincia"
    }

}, { collection: "poblaciones" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
PoblacionSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Poblacion", PoblacionSchema);