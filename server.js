require('dotenv').config();

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sequelize = require('./utils/getDBInstance');

require('./models/Session');

sequelize.authenticate()
    .then(() => console.log('Connected successfully'))
    .catch(err => console.log(`Error while connecting: ${err.message}`));

sequelize.sync( {alter: true })
    .then(() => console.log("All models were synchronized successfully."));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb",
    extended: true, parameterLimit: 50000 }))
app.use(expressLayouts);
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use(cookieParser('keyboard cat'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    store: new SequelizeStore({
        db: sequelize,
        table: 'Session',
    }),
}))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.POST || 3000,
    () => console.log('On http://localhost:3000'));
