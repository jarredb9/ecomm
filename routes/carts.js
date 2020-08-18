const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// Route 1: Receive a post request to add an item to a car
router.post('/cart/products', async (req, res) => {
	//Figure out the cart!
	let cart;
	if (!req.session.cartId) {
		//We don't have a cart, we need to create one,
		//and store the cart id on the req.sessoin.cartID property
		cart = await cartsRepo.create({ items: [] });
		req.session.cartId = cart.id;
	} else {
		//We have a cart! Lets get it from the repo
		cart = await cartsRepo.getOne(req.session.cartId);
	}

	//Or add new product to items array
	const existingItem = cart.items.find((item) => item.id === req.body.productId);
	if (existingItem) {
		//Increment quantity for existing product and save cart
		existingItem.quantity++;
	} else {
		//Add new product to items array
		cart.items.push({ id: req.body.productId, quantity: 1 });
	}
	//add items back to repo
	await cartsRepo.update(cart.id, { items: cart.items }); //find record we want to update (cart.id) and add items object

	res.redirect('/cart');
});

// Route 2: Receive a GET request to show all items in a cart
router.get('/cart', async (req, res) => {
	//when user is navigated to /cart do this
	if (!req.session.cartId) {
		//If no carId
		return res.redirect('/');
	}
	const cart = await cartsRepo.getOne(req.session.cartId);
	for (let item of cart.items) {
		//item === {id: , quantity} - what cart.items looks like
		const product = await productsRepo.getOne(item.id);

		//temp add product info from product repo to item object for displaying in cart, but does not save to cart repo
		item.product = product;
	}
	res.send(cartShowTemplate({ items: cart.items }));
});
// Route 3: Receive a post request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
	const { itemId } = req.body;
	const cart = await cartsRepo.getOne(req.session.cartId);

	const items = cart.items.filter((item) => item.id !== itemId); //if function is true add to items array else does not get added

	await cartsRepo.update(req.session.cartId, { items }); //replaces items in cart repo with new items object

	res.redirect('/cart');
});
module.exports = router;
