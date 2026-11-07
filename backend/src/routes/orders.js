const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderByNumber,
  trackOrder,
  validateVoucher,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:orderNumber', getOrderByNumber);
router.post('/validate-voucher', validateVoucher);
router.post('/track', trackOrder);

module.exports = router;
