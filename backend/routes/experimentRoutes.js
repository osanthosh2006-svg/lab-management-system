const express = require('express');
const {
  getExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment
} = require('../controllers/experimentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getExperiments).post(createExperiment);
router.route('/:id').get(getExperimentById).put(updateExperiment).delete(deleteExperiment);

module.exports = router;
