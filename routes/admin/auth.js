const express = require('express');
// const { check, validationResult } = require('express-validator'); Getting from middlewars

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
	requireEmail,
	requirePassword,
	requirePasswordConfirmation,
	requireEmailExists,
	requireValidPasswordForUser
} = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

//Homemade bodyParser, using body-parser library since it is way better
// const bodyParser = (req, res, next) => {
// 	if (req.method === 'POST') {
// 		req.on('data', (data) => {
// 			const parsed = data.toString('utf8').split('&');
// 			const formData = {};
// 			for (let pair of parsed) {
// 				const [ key, value ] = pair.split('=');
// 				formData[key] = value;
// 			}
// 			req.body = formData;
// 			next();
// 		});
// 	} else {
// 		next();
// 	}
// };

//Posting signup page without express validator
//
// router.post('/signup', async (req, res) => {
// 	const { email, password, passwordConfirmation } = req.body;
// 	const existingUser = await usersRepo.getOneBy({ email });
// 	if (existingUser) {
// 		return res.send('Email is in use');
// 	}

// 	if (password !== passwordConfirmation) {
// 		return res.send('Passwords must match');
// 	}

// 	//Create a user in a user repo
// 	const user = await usersRepo.create({ email, password });
// 	//Store the id of the user inside the users cooki
// 	req.session.userID = user.id; //Added by cookie-session!, .userID is object we are adding could call it anything

// 	res.send('Account created!');
// });

//With Validator
router.post(
	'/signup',
	[ requireEmail, requirePassword, requirePasswordConfirmation ],
	handleErrors(signupTemplate),
	async (req, res) => {
		const { email, password, passwordConfirmation } = req.body;
		//Create a user in a user repo
		const user = await usersRepo.create({ email, password });
		//Store the id of the user inside the users cooki
		req.session.userID = user.id; //Added by cookie-session!, .userID is object we are adding could call it anything

		res.redirect('/admin/products');
	}
);

router.get('/signout', (req, res) => {
	req.session = null; //makes browser forget info stored in cookie
	res.send('You are logged out');
});

router.get('/signin', (req, res) => {
	res.send(signinTemplate({}));
});

router.post(
	'/signin',
	[ requireEmailExists, requireValidPasswordForUser ],
	handleErrors(signinTemplate),
	async (req, res) => {
		const { email } = req.body;

		const user = await usersRepo.getOneBy({ email });

		req.session.userId = user.id;

		res.redirect('/admin/products');
	}
);

module.exports = router;
