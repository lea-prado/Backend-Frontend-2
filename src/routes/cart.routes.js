import { Router } from 'express';
import { 
  addProductToCart, 
  viewCart, 
  deleteProductFromCart, 
  purchaseCart 
} from '../controllers/cartController.js';
import { authorize } from '../middlewares/authorization.js';

const router = Router();

// Ver el carrito (para el usuario autenticado)
router.get('/:cid', authorize(['user']), viewCart);

// Agregar producto al carrito
router.post('/:cid/add/:pid', authorize(['user']), addProductToCart);

// Eliminar producto del carrito
router.post('/:cid/delete/:pid', authorize(['user']), deleteProductFromCart);

// Finalizar compra y emitir ticket
router.post('/:cid/purchase', authorize(['user']), purchaseCart);

export default router;
