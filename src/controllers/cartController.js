import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Ticket from '../models/Ticket.js';
import { v4 as uuidv4 } from 'uuid';

// Agrega producto al carrito
export const addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    let { quantity } = req.body;
    quantity = Number(quantity) > 0 ? Number(quantity) : 1;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    return res.redirect('/'); // Redirige a la página de productos
  } catch (error) {
    return res.status(500).json({ message: 'Error al agregar producto al carrito', error });
  }
};

// Muestra el contenido del carrito
export const viewCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const total = cart.products.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    return res.render('cart', {
      title: 'Mi Carrito',
      cart,
      total,
      user: req.user
    });
  } catch (error) {
    return res.status(500).send('Error al obtener el carrito');
  }
};

// Elimina un producto del carrito
export const deleteProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();

    return res.redirect(`/api/carts/${cid}`); // Redirige a la vista actualizada del carrito
  } catch (error) {
    return res.status(500).send('Error al eliminar producto del carrito');
  }
};

// Finaliza la compra y genera un ticket
export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).send('Carrito no encontrado');

    let totalAmount = 0;
    const notPurchased = [];

    for (const item of cart.products) {
      const prod = item.product;
      if (prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
        await prod.save();
        totalAmount += prod.price * item.quantity;
      } else {
        notPurchased.push({ product: prod, quantity: item.quantity });
      }
    }

    let ticket = null;
    if (totalAmount > 0) {
      ticket = new Ticket({
        code: uuidv4(),
        amount: totalAmount,
        purchaser: req.user.email
      });
      await ticket.save();
    }

    // Elimina del carrito los productos que sí se compraron
    cart.products = cart.products.filter(item =>
      notPurchased.find(np => np.product._id.toString() === item.product._id.toString())
    );
    await cart.save();

    return res.render('ticket', {
      title: 'Ticket de Compra',
      ticket,
      notPurchased: notPurchased.map(np => ({
        title: np.product.title,
        quantity: np.quantity
      })),
      user: req.user
    });
  } catch (error) {
    return res.status(500).send('Error al procesar la compra');
  }
};
