const axios = require('axios')
var express = require('express');
var router = express.Router();

const apiUrl = 'http://localhost:5000'

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.session.user) {
    const bookings = (await axios.get(`${apiUrl}/api/SessionBookingsAPI/`)).data
    const timeslots = []

    const session = new Date()
    session.setDate(session.getDate() + 1)
    session.setMilliseconds(0)
    session.setSeconds(0)
    session.setMinutes(0)

    for (let i=6; i<22; i++) {
      session.setHours(i)
      const booking = bookings.find(booking => booking.userId === req.session.user.id && new Date(booking.startTime).valueOf() === session.valueOf())

      const endDate = new Date(session)
      endDate.setHours(endDate.getHours()+1)

      timeslots.push({
        start: `${session.getHours()}:00`,
        startDate: endDate.toISOString(),
        end: `${session.getHours()+1}:00`,
        booked: !!booking,
        sessionId: booking ? booking.sessionBookingId : -1
      })
    }
    
    return res.render('bookings', {
      title: 'MaxFitness App - Bookings',
      timeslots,
      dayFormat: `${session.getDate()}/${session.getMonth()}/${session.getFullYear()}`
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
  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + 1)

  if (req.session.user && req.body.startDate) {
    await axios.post(`${apiUrl}/api/SessionBookingsAPI/`, {
      userId: req.session.user.id,
      startTime: startDate,
      endTime: endDate.toISOString()
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
