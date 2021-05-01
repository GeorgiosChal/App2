const mongodb=require("mongodb")
//enable enviroment variables
const dotenv=require("dotenv")
dotenv.config()

mongodb.connect(process.env.CONNECTIONSTRING,{useNewUrlParser:true,useUnifiedTopology:true},function(err,client){
    module.exports=client
   
    const app=require('./app')
    //port init
    let port=process.env.PORT

    app.listen(port,()=>console.log(`listend on port ${port}`)) 
})