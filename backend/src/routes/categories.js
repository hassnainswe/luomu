const express = require('express');
const router = express.Router();
const { getCategories, subscribeNewsletter } = require('../controllers/categoryController');

router.get('/', getCategories);

module.exports = router;

// Newsletter route (separate export)
const newsletterRouter = express.Router();
newsletterRouter.post('/', subscribeNewsletter);

module.exports.newsletterRouter = newsletterRouter;
module.exports = router;
