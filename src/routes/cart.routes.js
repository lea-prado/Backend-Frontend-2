import { Router } from 'express';
import {
  addProductToCart,
  viewCart,
  deleteProductFromCart,
  purchaseCart
} from '../controllers/cartController.js';
import { authorize } from '../middlewares/authorization.js';

const router = Router();

router.get('/:cid', authorize(['user']), viewCart);
router.post('/:cid/add/:pid', authorize(['user']), addProductToCart);
router.post('/:cid/delete/:pid', authorize(['user']), deleteProductFromCart);
router.post('/:cid/purchase', authorize(['user']), purchaseCart);

export default router;
