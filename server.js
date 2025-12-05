const {executeQuery} = require('./connection');

const express = require('express');
const bodyParser = require('body-parser');

const mainRoutes = require('./routes/main');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', mainRoutes);
app.use(express.static("public"));

app.listen(port, () => {
    console.log(`server runs at http://localhost:${port}`);
});