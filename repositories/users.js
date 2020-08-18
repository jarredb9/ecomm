const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
	async create(attrs) {
		//attrs ==== {email: , password: }
		attrs.id = this.randomID();

		const salt = crypto.randomBytes(8).toString('hex');
		//This version requires adding the rest of create into the callback
		// crypto.scrypt(attrs.password, salt, 64, (err, buf) => {
		// 	const hashed = buff.toString('hex');

		//Using promisfy above creates promised based version instead of callback version
		const buf = await scrypt(attrs.password, salt, 64);

		const records = await this.getAll();
		const record = {
			...attrs, //... Means create new object by removing all properties out of attrs and overwrite with new password
			password: `${buf.toString('hex')}.${salt}` //Period makes it easier to use split to seperate salt and hashed values
		};
		records.push(record);
		//write the updated 'records' array back to this.filename
		await this.writeAll(records);

		return record;
	}
	async comparePasswords(saved, supplied) {
		//Saved -> password saved in our database. 'hashed.salt'
		//Supplied -> password given by user trying to login

		//Not using destructuring
		// const result = saved.split('.');
		// const hashed = result[0];
		// const salt = result[1];

		const [ hashed, salt ] = saved.split('.'); // Same as above 3 lines using destructuring
		const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

		return hashed === hashedSuppliedBuf.toString('hex');
	}
}

//Better way to export, only need one copy of UsersRepository
module.exports = new UsersRepository('users.json');
//Another File
//cont repo = require('./users)
//repo.getAll()
//repo.getOne()

//Not ideal solution to export
// module.exports = UsersRepository;
//Another File..
//const UsersRepository = require('./users')
//const repo = new UsersRepository('users.json')

//Yet Another File
//const UsersRepository = require('./users')
//const repo = new UsersRepository('user.json') - missing s in users
//With multiple files get difficults to debug when it works sometimes and not others

//TESTING CODE
// const test = async () => {
// 	const repo = new UsersRepository('users.json');

// 	// await repo.create({ email: 'test@test.com' });
// 	// await repo.update('132456', { password: 'mypassword' });
// 	const user = await repo.getOneBy({ email: 'test@test.com', password: '1321' });

// 	console.log(user);
// };

// test();
