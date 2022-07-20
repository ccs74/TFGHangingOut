const { Schema, model, SchemaTypes } = require("mongoose");

const ProvinciaSchema = Schema({
    nombre: {
        type: String,
        required: true
    }

}, { collection: "provincias" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
ProvinciaSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Provincia", ProvinciaSchema);