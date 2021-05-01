const express =require('express')
const session=require('express-session')
//use sessions
const MongoStore=require('connect-mongo')
//flash messages
const flash=require('connect-flash')
const app=express()

//sesion init
const sessionOptions=session({
    secret: "JavaScript is not sooo cool",
    store: MongoStore.create({client: require('./db')}),
    resave:false,
    saveUninitialized:false,
    //1arg=milisec to sec. 2=sec to min 3= min tou hour, hour to one day
    cookie:{maxAge:1000*60*60*24,httpOnly:true }
})
app.use(sessionOptions)

app.use(flash())

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


module.exports=app