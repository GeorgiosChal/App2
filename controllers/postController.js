const Post=require('../models/Post')

exports.viewCreateScreen=function(req,res){
    res.render('create-post')
}

exports.apiCreate=function(req,res){
    let post=new Post(req.body,req.apiUser._id)
    post.create().then(function(newId){
        res.json("Post Created")
    }).catch(function (errors){
        res.json(errors)
    })
}

exports.create=function(req,res){
    let post=new Post(req.body,req.session.user._id)
    post.create().then(function(newId){
        req.flash("success","New post successfully created")
        req.session.save(()=> res.redirect(`/post/${newId}`))
    }).catch(function (errors){
        errors.forEach(error=>req.flash("errors",error))
        req.session.save(()=>res.redirect("/create-post"))
    })
}

exports.viewSingle=async function(req,res){
    try{
        let post=await Post.findSingleById(req.params.id,req.visitorId)
        res.render('single-post-screen',{post: post,title:post.title})
    }catch{
        res.render('404')    }
    
}

exports.viewEditScreen=async function(req,res){
    try{
        let post=await Post.findSingleById(req.params.id,req.visitorId)
        if(post.isVisitorOwner){
            res.render("edit-post",{post: post})
        }else{
            req.flash("errors","You do not have permission to perform that action")
            req.session.save(()=>res.redirect('/'))
        }
    }catch{
        res.render('404')
    }
}

exports.edit=function(req,res){
    let post=new Post(req.body,req.visitorId,req.params.id)
    post.update().then((status)=>{
        //the post was successfully updated in the database
        //or user did have permission but there were validation erros
        if(status=="success"){
            //post was updated in db
            req.flash("success","Post successfully updated.")
            req.session.save(()=>{
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }else{
            //validation erros
            post.errors.forEach(function(error){
                req.flash("errors", error)
            })
            req.session.save(()=>{
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(()=>{
        //a post with req id dont exist
        //or if the current visitor is not the owner
        req.flash("errors","You do not have persmission to perform that action")
        req.session.save(()=>res.redirect("/"))

    })
}

exports.delete=function(req,res){
    Post.delete(req.params.id,req.visitorId).then(()=>{
        req.flash("success","Post Successfully deleted.")
        req.session.save(()=>{
            res.redirect(`/profile/${req.session.user.username}`)
        })
    }).catch(()=>{
        req.flash("errors","You do not have permission to perfom that action")
        req.session.save(()=>res.redirect("/"))
    })
}

exports.apiDelete=function(req,res){
    Post.delete(req.params.id,req.apiUser._id).then(()=>{
        res.json("Success")
    }).catch(()=>{
        res.json("You do not have permission to perform that action")
    })
}

exports.search=function(req,res){
    Post.search(req.body.searchTerm).then((posts)=>{
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}