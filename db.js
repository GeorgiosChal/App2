const mongodb=require("mongodb")
//enable enviroment variables
const dotenv=require("dotenv")
dotenv.config()

mongodb.connect(process.env.CONNECTIONSTRING,{useNewUrlParser:true,useUnifiedTopology:true},function(err,client){
    module.exports=client.db()
   
    const app=require('./app')
    //port init
    let port=process.env.PORT
    if(port==null || port==""){
        port=3000
    }

    app.listen(port) 
})