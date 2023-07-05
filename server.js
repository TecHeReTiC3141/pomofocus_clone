const express = require('express');
const app = express();

const methodOverride = require('method-override');

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb",
    extended: true, parameterLimit: 50000 }))
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use('/', indexRouter);

app.listen(process.env.POST || 3000,
    () => console.log('On http://localhost:3000'));

