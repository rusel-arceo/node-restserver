const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./login')); //el ./   es porque están en el mismo directorio
app.use(require('./categoria')); 
app.use(require('./producto')); 


module.exports = app;