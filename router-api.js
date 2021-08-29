const apiRouter=require('express').Router()
const userController=require('./controllers/userController')
const postController=require ('./controllerS/postController')
const followController=require('./controllers/followController')

const cors=require('cors')

//use cors package in all routes
apiRouter.use(cors())

//no need to use /api to routes because we do that in app.use
apiRouter.post('/login',userController.apiLogin)
apiRouter.post('/create-post',userController.apiMustBeLogin,postController.apiCreate)
apiRouter.delete('/post/:id',userController.apiMustBeLogin,postController.apiDelete)
apiRouter.get('/postsByAuthor/:username', userController.apiGetPostsByUsername)

module.exports=apiRouter


