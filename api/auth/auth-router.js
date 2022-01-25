// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model.js');
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require('./auth-middleware.js');

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkUsernameFree, checkPasswordLength, async (req, res, next) => {
  const { username, password } = req.body;

  try {      
    const hash = bcrypt.hashSync(password, 10);
    const newUser = { username, password: hash };
    const createdUser = await Users.add(newUser);
    res.json(createdUser);
  } catch (err) {
    next(err)
  }
})
  

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.post('/login', checkUsernameExists, (req, res, next) => {
  const { username, password } = req.body;
  if (username && bcrypt.compareSync(password, req.user[0].password)) {
    req.session.user = req.user;
    res.json({ message: `Welcome ${username}` });
  } else {
    next({ status: 401, message: 'Invalid credentials' });
  }
})
  
/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
  router.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        res.json({ message: `Logout error` })
      } else {
        res.json({ message: `Successfully logged out` })
      }
    })
  } else {
    res.json({ message: `No session` })
  }
})
  
 module.exports = router;
// Don't forget to add the router to the `exports` object so it can be required in other modules
