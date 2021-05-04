const session = require("express-session")
const User=require("../models/User")

exports.login=function(req,res){
    let user=new User(req.body)
    user.login().then(function(result){
        req.session.user={username:user.data.username,
                            avatar: user.avatar,
                            _id:user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
        
    }).catch(function(e){
        //req.session.flash.errors=[e]
        req.flash('errors',e)
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.logout=function(req,res){
    //remember method
    req.session.destroy(function(){
        res.redirect('/') 
    })
    
}

exports.register=function(req,res){
    //new object with constructor of User in model/User.
    let user=new User(req.body)
    user.register().then(()=>{
        req.session.user={username:user.data.username,
                            avatar: user.avatar,
                            _id:user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch((regErrors)=>{
        regErrors.forEach(function(error){
            req.flash('regErrors',error)
        })
        req.session.save(function(){
            res.redirect('/')
        })
    })
    
}

exports.home=function(req,res){
    if(req.session.user){
        res.render('home-dashboard')
    }else{
        //in case of wrong login
        //As soon as the redirect happens its gonna access the coockie
        //with the error and is its going to automatically delete it 
        res.render('home-guest',{errors: req.flash('errors'), 
                                regErrors:req.flash('regErrors')})
        
    }
}

exports.mustBeLogin=function(req,res,next){
    if(req.session.user){
        next()
    }else{
        req.flash("errors","You must logged in to perfom that action")
        req.session.save(function(){
            res.redirect('/')
        })
    }
}
