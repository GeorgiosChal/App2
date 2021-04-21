//User Constructor
//inside the constructor should be propertys
//and outside the functions
let User=function(data){
    this.data=data
}

//prototype function that every User object can see
// outside of object and to not douplicate function on all User objects
//"Method of 'class' User"
User.prototype.register=function(){

}

module.exports=User