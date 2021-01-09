var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var productoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'], unique: [true, 'El nombre debe ser unico'] },
    precioUni: { type: Number, required: [true, 'El precio únitario es necesario'] },
    descripcion: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'categoria', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario' }  //Recuerd ¿a que la referencia se escribe igual a como se exportó en el modelo  module.exports = mongoose.model('categoria',categoriaSquema); categoria -> Categoria marca error
});


module.exports = mongoose.model('producto', productoSchema);

