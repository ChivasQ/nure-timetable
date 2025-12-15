const express = require('express');
const bodyParser = require('body-parser');
const sqlManager = require('./utils/SqlManager');
let process = require('process');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`\x1b[32m[INFO]\x1b[0m\tServer runs at http://localhost:${port}`);
});



// process.once('SIGINT', function () {
//   console.log('Reloading...');
//    sqlManager.load();
// }); 
