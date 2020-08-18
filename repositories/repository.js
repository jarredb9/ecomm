const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
	constructor(filename) {
		if (!filename) {
			throw new Error('Creating a repo requires a filename');
		}

		this.filename = filename;

		try {
			fs.accessSync(this.filename);
		} catch (err) {
			fs.writeFileSync(this.filename, '[]');
		}
	}

	async create(attrs) {
		attrs.id = this.randomID();

		const records = await this.getAll();
		records.push(attrs);
		await this.writeAll(records);

		return attrs;
	}

	async getAll() {
		// //Open the file called this.filename
		// const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8' });
		// //Read its contents
		// console.log(contents);
		// //parse the contents
		// const data = JSON.parse(contents);
		// //return the parsed data}
		// return data;

		//Refactored
		return JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf8' }));
	}

	async writeAll(records) {
		//write the updated 'records' array back to this.filename
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}

	randomID() {
		return crypto.randomBytes(4).toString('hex');
	}

	async getOne(id) {
		const records = await this.getAll();
		return records.find((record) => record.id === id);
	}

	async delete(id) {
		const records = await this.getAll();
		const filteredRecords = records.filter((record) => record.id !== id);
		await this.writeAll(filteredRecords);
	}

	async update(id, attrs) {
		const records = await this.getAll();
		const record = records.find((record) => record.id === id);

		if (!record) {
			throw new Error(`Record with id ${id} not found`);
		}
		//record === {email: 'test@test.com'}
		// attrs === {password: 'mypassword'}
		Object.assign(record, attrs);
		//record === {email: 'test@test.com', password: 'mypassword'}
		await this.writeAll(records);
	}

	async getOneBy(filters) {
		const records = await this.getAll();

		for (let record of records) {
			let found = true;

			for (let key in filters) {
				//when iterating through object use for-in loop
				if (record[key] !== filters[key]) {
					found = false;
				}
			}
			if (found) {
				return record;
			}
		}
	}
};
