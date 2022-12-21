const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const methodOverride = require('method-override')
// const fetch = (...args) =>
//     import('node-fetch').then(({default:fetch}) => {
//         fetch(...args)
//     }) // npm install node-fetch

const indexRouter = require('./routes/index') 
const userRouter = require('./routes/user') 
const adminRouter = require('./routes/admin') 

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
// app.set('views', __dirname + '/views')
// app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(sessions({
    secret: "SupposedEnvironmentVariable",
    saveUninitialized:true,
    cookie: { maxAge: 7200000 }, //milliseconds, 2hr
    resave: false  }));
app.use(cookieParser());
let session

const mongoose = require('mongoose')
mongoose.connect( process.env.DB_URL,  { useNewUrlParser: true } )


app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/admin', adminRouter)


app.listen(3003, ()=>{
    console.log('running on port 3003!')
})


// console.log(process.env.DB_URL )
