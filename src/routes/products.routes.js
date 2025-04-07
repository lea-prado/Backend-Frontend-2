// src/routes/product.routes.js
import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authorize } from '../middlewares/authorization.js';
import Product from '../models/Product.js';

const router = Router();

// Endpoint para obtener productos en formato JSON
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error });
  }
});

// Rutas protegidas para administrador: crear, actualizar y eliminar productos
router.post('/', authorize(['admin']), createProduct);
router.put('/:pid', authorize(['admin']), updateProduct);
router.delete('/:pid', authorize(['admin']), deleteProduct);

// Ruta para renderizar la vista de productos
router.get('/view', async (req, res) => {
  try {
    const products = await Product.find();
    // Se pasa req.user (si existe) para evaluar el rol en la vista.
    res.render('productList', { title: 'Productos', products, user: req.user || null });
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
});

export default router;
