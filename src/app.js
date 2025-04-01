const express = require('express');
const path = require('path');
const config = require('../config');
const session = require('express-session');
const LokiStore = require('connect-loki')(session);

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new LokiStore({ path: 'session-store.db' }),
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Make session data available to views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.successMessage = req.session.successMessage;
  delete req.session.successMessage;
  
  next();
});

// Import routes
const searchRouter = require('./routes/search');
const usersRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard')

// Register routes
app.get('/', (req, res) => {
  res.render('search', { title: 'Care Connect' });
});

app.get('/users', (req, res) => {
  res.render('register', { title: 'Register -Care Connect' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Care Connect Dashboard' });
});

// Mount the routes
app.use('/search', searchRouter);
app.use('/users', usersRouter);
app.use('/dashboard', dashboardRouter); 

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.locals.message = err.message;
  res.locals.error = config.nodeEnv === 'production' ? {} : err;
  
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;