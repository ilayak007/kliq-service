 const express = require('express');
 const router = express.Router();

 const {updateMatchResult} = require('../controllers/updateMatchResultController');

 
router.put('/update-match-result', updateMatchResult);

 
 module.exports = router;
 
