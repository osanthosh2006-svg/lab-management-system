const express = require('express');
const {
  getInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  startUsage,
  endUsage
} = require('../controllers/instrumentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getInstruments).post(authorize('admin'), createInstrument);
router
  .route('/:id')
  .get(getInstrumentById)
  .put(authorize('admin'), updateInstrument)
  .delete(authorize('admin'), deleteInstrument);

router.post('/:id/usage/start', startUsage);
router.post('/:id/usage/:logId/end', endUsage);

module.exports = router;
