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
//
const csrf = require('csurf')

const app=express()

//add user submited data to request body
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//api router
app.use('/api', require('./router-api'))

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
const { Socket } = require('dgram')

//add user submited data to request body
app.use(express.urlencoded({extended:false}))

app.use(express.json())

//enable public folder to be available on client side
app.use(express.static('public'))
//we are setting view templates with the name views <<2nd arg is the name>>
app.set('views','views')
//for views, we set the engine as ejs
app.set('view engine','ejs')

//csurf
app.use(csrf())

app.use(function(req,res,next){
    res.locals.csrfToken = req.csrfToken()
    next()
})

//Requests
app.use('/',router)

app.use(function(err,req,res,next){
    if(err){
        if(err.code == "EBADCSRFTOKEN"){
            req.flash('errors',"Cross site request forgery detected")
            req.session.save(()=>res.redirect('/'))
        }else{
            res.render("404")
        }
    }
})

//server
const server=require('http').createServer(app)

//Socket///////////////
const io=require('socket.io')(server)
/*
same as 
const {Server}=require("socket.io")
const io=new Server(server)
*/

io.use(function(socket,next){
    sessionOptions(socket.request,socket.request.res,next)
})

io.on('connection',(socket)=>{
    if(socket.request.session.user){
        let user=socket.request.session.user
        socket.emit('welcome',{
            username:user.username,
            avatar: user.avatar})
        socket.on('chatMessageFromBroswer',function(data){
            socket.broadcast.emit('chatMessageFromServer',{
                message: sanitizeHTML(data.message,{allowedAttributes:{},allowedTags:[]}),
                username: user.username,
                avatar:user.avatar
            })
        })
    }
    else{

    }
})

module.exports=server