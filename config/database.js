const  mongoose = require('mongoose')

require('dotenv').config()

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL,
    ).then(()=>console.log("DB Connected Successfully✅"))
    .catch((error)=>{ 
        console.log("this error occured"+ error)
        process.exit(1)
    })
}