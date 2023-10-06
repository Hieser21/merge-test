const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, 'build')))
app.use('/static', express.static(__dirname + 'build/static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())
//calling Database function
require('./config/database').connect()

//route importing and mounting
const user = require('./routes/user')


app.use(user)
app.get('/',  (req,res) => {
    res.sendFile(__dirname + '/build/index.html')
})
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'))
})

app.listen(PORT, ()=>{
    console.log("Server Started")
   
})