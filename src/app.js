const express = require('express');
const path = require('path');
// const config = require('../config');
const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.render('home', { title: 'Search Referrals' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Something went wrong!'
  });
});

module.exports = app;