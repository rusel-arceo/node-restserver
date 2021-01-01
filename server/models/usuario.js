/*Este atchivo manejará el modelo de datos del mongo*/

const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');

let Schema = mongoose.Schema; //Esquema para el manejo de la base de datos, es un estandar que Squema sea con S

let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'], //Establecemos los valores permitidos
    message: '{VALUE} no es un rol valido' //El mensaje si no se establece un valor permitido
}

let usuarioSquema= new Schema(
    {
        nombre:{ //En este caso el nombre se tomará de la BD
            type: String, //Definimos el tipo, son parametros opcionales
            required: [true, 'El nombre es necesario'] //decimos que es requerido, obligatorio. : true  al ponerlos entre corchetes es para poner definir un mensaje personalizado y en su caso no obtener el generico
        },
        email: { 
            type: String,
            unique: true,
            required:[true,'El correo es necesario']
        },
        password: { 
            type: String,
            required:[true,'La contraseña es obligatoria']
        },
        img:{
            type:String, //La imagen se almacenará en un string
            required:false //Como no es obligatoria la podria omitir
        },
        role: {
            type: String,
            default: 'USER_ROLE',
            enum: rolesValidos  //Definidos arriba, en el enum, decimos que los valores que puede tomar son los establecidos.
        },
        estado:{
            type: Boolean,
            default: true
        },
        google:{  //Se refiere a que si es usuario decide usar su cueNTA DE GOOGLE para us registro, por lo que de ahí se tomarán sus datos.por defecto es false
            type: Boolean,
            default: false  
        }
    });  //Definimos el squemas (Viene siendo los campos de la colección

    /*Modificaremos el schema para que nunca imprima el password*/
    usuarioSquema.methods.toJSON = function(){  //.methods --metodos de schema , .toJSON siempre se llama antes de hacer una impresión JSON de schema   
        //No usar función de flecha porque no permite el uso de this, el cual necesitaremos
        let user = this;
        let useObject = user.toObject();
        delete useObject.password;

        return useObject;
    } 


    //Exportando
    usuarioSquema.plugin( uniqueValidator, { message:'{PATH} debe de ser único' }); //El path inserta la procedencia del error, en este caso email.
    module.exports = mongoose.model ('usuario', usuarioSquema);
    //Exportamos el modelo, decimos que se llamará usuario y que utilizará el esquema de usuarioSquema.