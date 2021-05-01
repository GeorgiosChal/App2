const express=require('express')
const router=express.Router()
//we "imclude here the following file as userController"
//router should only do routing tasks, the functions is included 
//in require variables as part of the MVC (Model,View,Controller)
const userController=require('./controllers/userController')

router.get('/',userController.home)
router.post('/register',userController.register)
router.post('/login',userController.login)
router.post('/logout',userController.logout)

//router will return on where is been required. in this case app.js
module.exports=router