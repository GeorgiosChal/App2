const User=require("../models/User")

exports.login=function(req,res){
    
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
    res.render('home-guest') 
}