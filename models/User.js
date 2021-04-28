const validator = require("validator")
const bcrypt=require("bcryptjs")
const usersCollection=require('../db').db().collection('users')
//User Constructor
//inside the constructor should be propertys
//and outside the functions
let User=function(data){
    this.data=data
    this.errors=[]
}

//prototype function that every User object can see
// outside of object and to not douplicate function on all User objects
//"Method of 'class' User"
User.prototype.register=function(){
    //validate data
    this.cleanUp()
    this.validate()

    // 2 only if no vakudatuib errors
    //then save the user data into a database
    if (!this.errors.length){
        //hash user password only when there is no errors
        let salt=bcrypt.genSaltSync(10)
        this.data.password=bcrypt.hashSync(this.data.password,salt)
        usersCollection.insertOne(this.data)
    }
}

User.prototype.cleanUp=function(){
    if (typeof(this.data.username)!="string"){this.data.username=""}
    if (typeof(this.data.email)!="string"){this.data.email=""}
    if (typeof(this.data.password)!="string"){this.data.password=""}

    //ignore other bogus properties by recreating the object 
    //with the wanted propertys
    this.data={
        username:this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password,
    }
}

User.prototype.validate=function(){
    User.prototype.validate = function() {
        if (this.data.username == "") {this.errors.push("You must provide a username.")}
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers.")}
        if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
        if (this.data.password == "") {this.errors.push("You must provide a password.")}
        if (this.data.password.length > 0 && this.data.password.length < 12) {this.errors.push("Password must be at least 12 characters.")}
        if (this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters.")}
        if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username must be at least 3 characters.")}
        if (this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters.")}
      }
      
}

//for login
//
User.prototype.login=function(){
    return new Promise((resolve,reject)=>{
        this.cleanUp()
        
        usersCollection.findOne({
            username: this.data.username
        }).then((attemptedUser) => {
            if(attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)){
                resolve("All good")
            }
            else {
                reject("invalid username or pass")
            }
        }).catch(function(){
            reject("please try again later")
        });
    });
}




module.exports=User