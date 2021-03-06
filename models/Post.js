const postCollection=require('../db').db().collection('posts')
const followsCollection=require('../db').db().collection('follows')
const ObjectID=require('mongodb').ObjectID
const User=require('./User')
const sanitizeHTML=require('sanitize-html')

let Post=function(data,userId,requestedPostId){
    this.data=data
    this.userId=userId
    this.errors=[]
    this.requestedPostId=requestedPostId
}

Post.prototype.cleanUp=function(){
    if(typeof(this.data.title)!='string'){this.data.title=""}
    if(typeof(this.data.body)!='string'){this.data.body=""}
    
    //get rid of bogus properties
    //title no need sanitize because nay tags will be escaped
    this.data={
        title: sanitizeHTML(this.data.title.trim(),{allowedTags:[],allowedAttributes:[]}),
        body: sanitizeHTML(this.data.body.trim(),{allowedTags:[],allowedAttributes:[]}),
        createdDate: new Date(),
        author: ObjectID(this.userId)
    }
}

Post.prototype.validate=function(){
    if(this.data.title==""){this.errors.push("You must provide a title")}
    if(this.data.body==""){this.errors.push("You must provide post content")}
}

Post.prototype.create=function(){
    return new Promise((resolve,reject)=>{
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            //save post to database
            postCollection.insertOne(this.data).then((info)=>{
                resolve(info.ops[0]._id)
            }).catch(()=>{
                this.errors.push("Please try again later")
                reject(this.errors)
            })
        }else{
            reject(this.errors)
        }
    })
}

Post.prototype.update=function(){
    return new Promise(async (resolve,reject)=>{
       
            let post=await Post.findSingleById(this.requestedPostId,this.userId)
            if(post.isVisitorOwner){
                let status=await this.actuallyUpdate()
                resolve(status)
            }else{
                reject()
            }

    })
}

Post.prototype.actuallyUpdate=function(){
    return new Promise(async(resolve,reject)=>{
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
           await postCollection.findOneAndUpdate({
                _id: new ObjectID(this.requestedPostId)
            }, {$set:{title: this.data.title,
                    body: this.data.body
                }
            })
            resolve("success")
        }else{
            resolve("failure")
        }
    })
}

Post.reusablePostQuery=function(uniqueOperations,visitorId,isSearch){
    return new Promise(async function(resolve,reject){
        //if we are searching we need to use SORT
        //after projection instead after match
        afterUniqueOperations=[]
        if(isSearch){
            afterUniqueOperations[0]=uniqueOperations[1]
            uniqueOperations=uniqueOperations.slice(0,1)
        }
        let aggOperations=uniqueOperations.concat([
            {$lookup: {from: "users",localField:"author",foreignField: "_id",as: "authorDocument"}},
            {$project: {
                title:1,
                body:1,
                createdDate:1,
                authorId:"$author",
                author: {$arrayElemAt: ["$authorDocument",0]}
            }}
        ],afterUniqueOperations)
        let posts=await postCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object. (exclude not wanted fields)
        posts=posts.map(function(post){
            post.isVisitorOwner=post.authorId.equals(visitorId)
            //remove authorId from leaking
            //post.authorId=undefined
            post.author={
                username:post.author.username,
                avatar: new User(post.author,true).avatar
            }
            return post
        })
        resolve(posts)
    })
}
/* the result
[
  {
    _id: 
    title: 
    body: 
    authorId:
    author: {
      username: 
      avatar: 
    },
    isVisitorOwner: bool
  }
]
*/


Post.findSingleById=function(id,visitorId){
    return new Promise(async function(resolve,reject){
        if(typeof(id)!="string" || !ObjectID.isValid(id)){
            reject()
            return
        }
        
        let posts=await Post.reusablePostQuery([
            {$match:{_id:new ObjectID(id)}}
        ],visitorId)

        if(posts.length){
            resolve(posts[0])
        }else{
            reject()
        }
    })
}

Post.findByAuthorId=function(authorId){
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate:-1}}
    ])
}

Post.delete=function(postIdToDelete,currentUserId){
    return new Promise(async (resolve,reject)=>{
        try {
            let post= await Post.findSingleById(postIdToDelete,currentUserId)
            if(post.isVisitorOwner){
                await postCollection.deleteOne({ 
                    _id: new ObjectID(postIdToDelete) 
                })
                resolve()
            }else{
                reject()
            }
        } catch {
            reject()
        }
    })
}

Post.search=function(searchTerm){
    return new Promise(async (resolve,reject)=>{
        try {
            if (typeof(searchTerm)=="string"){
                let posts=await Post.reusablePostQuery([
                    {$match: {$text: {$search: searchTerm}}},
                    {$sort: {score: { $meta: "textScore" }}}
                  ],0,true)
                resolve(posts)
            }else{
                reject()
            }
        } catch  {
            console.log("search error")
        }
        
    })
}

Post.countPostsByAuthor=function(id){
    return new Promise(async(resolve,reject)=>{
        let postCount=await postCollection.countDocuments({author: id})
        resolve (postCount)
    })
}


Post.getFeed=async function(id){
    //create an array of the users ids that user follows
    let followedUsers=await followsCollection.find({authorId: new ObjectID(id)}).toArray()
    followedUsers=followedUsers.map(function(followedDoc){
        return followedDoc.followedId
    })

    //look for posts where the author is in the above array
    return Post.reusablePostQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort:{createdDate:-1}}
    ])
}

module.exports=Post