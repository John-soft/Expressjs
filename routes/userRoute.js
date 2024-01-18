const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const router = express.Router()


router.route('/getAllUsers').get(
    userController.getAllUsers)

router.route('/updatePassword').patch(
    authController.protect,
    userController.updatePassword)

router.route('/updateDetails').patch(
    authController.protect,
    userController.updateDetails
)

router.route('/deleteDetails').delete(
    authController.protect,
    userController.deleteDetails
)

module.exports = router
