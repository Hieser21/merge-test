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
let indexPath = path.join(__dirname, 'build/index.html')
app.get('/',  (req,res) => {
    res.sendFile(indexPath)
})
app.get('/home', (req, res) => {
    res.sendFile(indexPath)
})
app.get('/otp', (req, res) => {
    res.sendFile(indexPath)
})
app.get('/register', (req, res) => {
    res.sendFile(indexPath)
})

app.get('/forgot-password', (req, res) => {
    res.sendFile(indexPath)
})

app.get('/reset/:userId/:token', (req, res) => {
    res.sendFile(indexPath)
})

app.listen(PORT, ()=>{
    console.log("Server Started")
   
})