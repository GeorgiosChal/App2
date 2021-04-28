const session = require("express-session")
const User=require("../models/User")

exports.login=function(req,res){
    let user=new User(req.body)
    user.login().then(function(result){
        req.session.user={
            username:user.data.username
        }
        res.send(result)
    }).catch(function(e){
        res.send(e)
    })
}

exports.logout=function(req,res){
    
}

exports.register=function(req,res){
    //new object with constructor of User in model/User.
    let user=new User(req.body)
    user.register()
    if (user.errors.length>0){
        res.send(user.errors)
    }else{
        res.send("all god")
    }
}

exports.home=function(req,res){
    if(req.session.user){
        res.send("i remember you")
    }else{
        res.render('home-guest') 
    }
}

