const express=require('express')
const router=express.Router()
//we "imclude here the following file as userController"
//router should only do routing tasks, the functions is included 
//in require variables as part of the MVC (Model,View,Controller)
const userController=require('./controllers/userController')
const postController=require ('./controllerS/postController')
const followController=require('./controllers/followController')

//user related routes
router.get('/',userController.home)
router.post('/register',userController.register)
router.post('/login',userController.login)
router.post('/logout',userController.logout)

//post related routes
router.get('/create-post',userController.mustBeLogin,postController.viewCreateScreen)
router.post('/create-post',userController.mustBeLogin,postController.create)
router.get('/post/:id',postController.viewSingle)
router.get('/post/:id/edit',userController.mustBeLogin,postController.viewEditScreen)
router.post('/post/:id/edit',userController.mustBeLogin,postController.edit)
router.post('/post/:id/delete',userController.mustBeLogin,postController.delete)
router.post('/search',postController.search)

//profile related routes
router.get('/profile/:username',userController.ifUserExists,userController.sharedProfileData,userController.profilePostsScreen)
router.get('/profile/:username/followers',userController.ifUserExists,userController.sharedProfileData,userController.profileFollowersScreen)
router.get('/profile/:username/following',userController.ifUserExists,userController.sharedProfileData,userController.profileFollowingScreen)


//follow related routes
router.post('/addFollow/:username',userController.mustBeLogin,followController.addFollow)
router.post('/removeFollow/:username',userController.mustBeLogin,followController.removeFollow)

//router will return on where is been required. in this case app.js
module.exports=router