const { validationResult } = require('express-validator');

module.exports = {
	handleErrors(templateFunc, dataCb) {
		return async (req, res, next) => {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				//call data callback
				let data = {};
				if (dataCb) {
					data = await dataCb(req);
				}
				return res.send(templateFunc({ errors, ...data }));
			}

			next(); //everything went well invoke next function
		};
	},
	requireAuth(req, res, next) {
		if (!req.session.userId) {
			return res.redirect('/signin');
		}
		next();
	}
};
