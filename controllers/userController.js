const session = require("express-session")
const User=require("../models/User")
const Post=require("../models/Post")
const Follow=require("../models/Follow")

const jwt=require('jsonwebtoken')

exports.apiGetPostsByUsername=async function(req,res){
    try {
        let authorDoc=await User.findByUsername(req.params.username)
        let posts=await Post.findByAuthorId(authorDoc._id)
        res.json(posts)
    } catch (e) {
        res.json("Sorry, Invalid User Requested")
    }
}

//object in req= {username: this.username.value}
exports.doesUsernameExist=function(req,res){
    User.findByUsername(req.body.username).then(function(){
        res.json(true)
    }).catch(function(){
        res.json(false)
    })
}

exports.doesEmailExist=async function(req,res){
    let emailBool= await User.doesEmailExist(req.body.email)
    res.json(emailBool)
}

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

exports.apiLogin=function(req,res){
    let user=new User(req.body)
    user.login().then(function(result){
        res.json(jwt.sign({_id:user.data._id},process.env.JWTSECRET,{expiresIn:"7d"}))
        
    }).catch(function(e){
       res.json("SOrry not sorry")
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

exports.home=async function(req,res){
    if(req.session.user){
        //fetch feed of current user
        let posts=await Post.getFeed(req.session.user._id)
        res.render('home-dashboard',{
            posts: posts
        })
    }else{
        //in case of wrong login
        //As soon as the redirect happens its gonna access the coockie
        //with the error and is its going to automatically delete it 
        res.render('home-guest',{regErrors:req.flash('regErrors')})
        
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

exports.apiMustBeLogin=function(req,res,next){
    try {
        req.apiUser=jwt.verify(req.body.token,process.env.JWTSECRET)
        next()
    } catch (e) {
        res.json("Sorry you must provide a valid token")
    }
}

exports.ifUserExists=function(req,res,next){
    User.findByUsername(req.params.username).then(function(userDocument){
        req.profileUser=userDocument
        next()
    })
    .catch(function(){
        res.render("404")
    })
}

exports.profilePostsScreen=function(req,res){
    // ask our post model for post by a certain author id
    Post.findByAuthorId(req.profileUser._id).then(function(posts){
        res.render('profile',{
            title: `Profile for ${req.profileUser.username}`,
            currentPage:"posts",
            posts:posts,
            profileUsername:req.profileUser.username,
            profileAvatar:req.profileUser.avatar,
            isFollowing:req.isFollowing,
            isVisitorsProfile:req.isVisitorsProfile,
            counts:{
                postCount:req.postCount,
                followerCount:req.followerCount,
                followingCount:req.followingCount
            }
        })
    }).catch(function(){
        res.render("404")
    })
}

exports.sharedProfileData=async function(req,res,next){
    let isVisitorsProfile=false
    let isFollowing=false
    if(req.session.user){
        isVisitorsProfile=req.profileUser._id.equals(req.session.user._id)
        isFollowing=await Follow.isVisitorFollowing(req.profileUser._id,req.visitorId)
    }
    req.isVisitorsProfile=isVisitorsProfile
    req.isFollowing=isFollowing
    //retrive post,follower,following count
    let postCountPromise=Post.countPostsByAuthor(req.profileUser._id)
    let followerCountPromise=Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise=Follow.countFollowingById(req.profileUser._id)
    let [postCount,followerCount,followingCount]=await Promise.all([postCountPromise,followerCountPromise,followingCountPromise])
    req.postCount=postCount
    req.followerCount=followerCount
    req.followingCount=followingCount
    next()
}

exports.profileFollowersScreen=async function(req,res){
    try {
        let followers=await Follow.getFollowersById(req.profileUser._id)
        res.render('profile-followers',{
        currentPage:"followers",
        profileUsername:req.profileUser.username,
        profileAvatar:req.profileUser.avatar,
        isFollowing:req.isFollowing,
        isVisitorsProfile:req.isVisitorsProfile,
        followers:followers,
        counts:{
            postCount:req.postCount,
            followerCount:req.followerCount,
            followingCount:req.followingCount
        }
    })
    } catch {
        res.render("404")
    }
}

exports.profileFollowingScreen=async function(req,res){
    try {
        let following=await Follow.getFollowingById(req.profileUser._id)
        res.render('profile-following',{
        currentPage:"following",
        profileUsername:req.profileUser.username,
        profileAvatar:req.profileUser.avatar,
        isFollowing:req.isFollowing,
        isVisitorsProfile:req.isVisitorsProfile,
        following:following,
        counts:{
            postCount:req.postCount,
            followerCount:req.followerCount,
            followingCount:req.followingCount
        }
    })
    } catch {
        res.render("404")
    }
}