const axios = require('axios')
const moment = require('moment')
var express = require('express');
var router = express.Router();

const apiUrl = process.env.API_URL

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.session.user) {
    const bookings = (await axios.get(`${apiUrl}/api/SessionBookingsAPI/`)).data
    const timeslots = []

    const session = moment()
    session.set({
      minute: 0,
      second: 0,
      millisecond: 0
    })
    session.add(1, 'd')

    for (let i=6; i<22; i++) {
      session.set('h', i)
      const booking = bookings.find(booking => booking.userId === req.session.user.id && new Date(booking.startTime).valueOf() === session.valueOf())

      const endDate = session.clone()
      endDate.add(1, 'h')

      timeslots.push({
        start: `${session.hour()}:00`,
        startDate: session.format(),
        end: `${endDate.hour()}:00`,
        booked: !!booking,
        sessionId: booking ? booking.sessionBookingId : -1
      })
    }
    
    return res.render('bookings', {
      title: 'MaxFitness App - Bookings',
      timeslots,
      dayFormat: `${session.day()}/${session.month()}/${session.year()}`,
      username: req.session.user.userName
    });
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

// Book timeslot
router.post('/book', async function(req, res) {
  const startDate = req.body.startDate
  const endDate = moment(startDate)
  endDate.add('h', 1)

  if (req.session.user && req.body.startDate) {
    await axios.post(`${apiUrl}/api/SessionBookingsAPI/`, {
      userId: req.session.user.id,
      startTime: startDate,
      endTime: endDate.format()
    })
  }

  res.redirect('/')
})

// Cancel a booking
router.get('/cancel/:id', async function(req, res) {
  if (req.session.user) {
    await axios.delete(`${apiUrl}/api/SessionBookingsAPI/${req.params.id}`)
  }
  res.redirect('/')
})

module.exports = router;
