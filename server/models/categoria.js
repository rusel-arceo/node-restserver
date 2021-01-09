
const mongoose = require('mongoose');
//let usuario = require('./usuario'); 
let Schema = mongoose.Schema;

let categoriaSquema = new Schema(
    {
        descripcion:{
            type: String,
            unique: [true,'Solo puede haber un producto con esa descripción'],
            required: [true, 'Se requiere una descripción']
        },
        usuario: {
            type: Schema.Types.ObjectId, ref: 'usuario'
        }
    });

    module.exports = mongoose.model('categoria',categoriaSquema);
    
    
    
