const User=require("../models/User")

exports.login=function(req,res){
    
}

exports.logout=function(req,res){
    
}

exports.register=function(req,res){
    //new object with constructor of User in model/User.
    let user=new User(req.body)
    user.register()
    res.send("todo")
}

exports.home=function(req,res){
    res.render('home-guest') 
}