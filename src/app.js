const express = require('express');
const path = require('path');
const config = require('../config');

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import routes
const searchRouter = require('./routes/search');

// Register routes
app.get('/', (req, res) => {
  res.render('search', { title: 'Care Connect' });
});

// Mount the routes
app.use('/search', searchRouter);

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