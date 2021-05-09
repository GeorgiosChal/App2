const express =require('express')
const session=require('express-session')
//use sessions
const MongoStore=require('connect-mongo')
//flash messages
const flash=require('connect-flash')
//markdown
const markdown=require('marked')
//sanitizehtml
const sanitizeHTML=require('sanitize-html')
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

//we have 'user' property from within any ejs template
app.use(function(req,res,next){
    //make our markdown function available from within ejs template
    //also sanitize it to avoid showing any links (database will still include links)
    res.locals.filterUserHTML=function(content){
        return sanitizeHTML(markdown(content),{allowedTags:['p','br','ul','ol','li','strong','i','bold','h1','h2','h3','h4','h5','h6'],allowedAttributes:[]})
    }
    //make all errors and success flash messages available from all templates
    res.locals.errors=req.flash("errors")
    res.locals.success=req.flash("success")
    //make current user id available on the req object
    if(req.session.user){req.visitorId=req.session.user._id}
    else{req.visitorId=0}
    //we have 'user' property from within any ejs template
    res.locals.user=req.session.user
    next()
})


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