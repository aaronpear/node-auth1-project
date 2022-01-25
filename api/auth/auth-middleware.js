const Users = require('../users/users-model.js');

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  // if (!req.session.user) {
  //   next({ status: 401, message: 'You shall not pass!' });
  // }
  next();
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  const { username } = req.body;

  try {
    const existingUser = await Users.findBy({ username: username });
    if (existingUser) {
      next({ status: 422, message: 'Username taken' });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  const { username } = req.body;

  try {
    const existingUser = await Users.findBy({ username: username });
    if (!existingUser) {
      next({ status: 401, message: 'Invalid credentials' });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  const { password } = req.body;
  if (!password || password.length <= 3) {
    next({ status: 422, message: 'Password must be longer than 3 chars' });
  } else {
    next();
  }
}

module.exports = { restricted, checkUsernameFree, checkUsernameExists, checkPasswordLength };
// Don't forget to add these to the `exports` object so they can be required in other modules
