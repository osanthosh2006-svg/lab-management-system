const express = require('express');
const {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample
} = require('../controllers/sampleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getSamples).post(createSample);
router.route('/:id').get(getSampleById).put(updateSample).delete(deleteSample);
router.patch('/:id/status', updateSampleStatus);

module.exports = router;
