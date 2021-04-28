const axios = require('axios')
var express = require('express');
var router = express.Router();

const apiUrl = 'http://localhost:5000'

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.session.user) {
    const bookings = await axios.get(`${apiUrl}/api/SessionBookingsAPI/`)
    console.log(bookings)
    return res.render('bookings', { title: 'MaxFitness App - Bookings' });
  }
  res.render('index', { title: 'MaxFitness App' });
});

// Logout user
router.get('/logout', function(req, res) {
  req.session.destroy()
  res.redirect('/')
})

// Login user
router.post('/login', async function(req, res) {
  if (req.body.login) {
    // Check user's login
    const response = await axios.post(`${apiUrl}/api/SessionBookingsAPI/CheckLogin?login=${req.body.login}`)
    if (response) {
      req.session.user = response.data
    }
  }
  res.redirect('/')
})

module.exports = router;
