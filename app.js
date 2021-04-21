const express =require('express')
const app=express()

//sets a router. value of router should be whatever returned
//from router.js file with line:module.exports=router
const router=require('./router')

//add user submited data to request body
app.use(express.urlencoded({extended:false}))

app.use(express.json())

//enable public folder to be available on client side
app.use(express.static('public'))
//we are setting view templates with the name views <<2nd arg is the name>>
app.set('views','views')
//for views, we set the engine as ejs
app.set('view engine','ejs')


//Requests
app.use('/',router)


app.listen(3000) 