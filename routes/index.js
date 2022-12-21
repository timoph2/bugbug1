const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const Account = require('../models/Account');

const fetch = (...args) =>
    import('node-fetch').then(({default:fetch}) => fetch(...args)) // npm install node-fetch
//^need import in router itself, not in main app.js

const app = express()
const passport = require('passport')
const sessions = require('express-session')
require('./auth'); 


app.use(sessions({secret: 'secretToken_ENV',
resave: true,saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())




let name

router.get('/', (req,res) => {
    res.render('login.ejs')
})


router.post('/', async (req,res) => {
    let name = req.body.name
    let password = req.body.password
    let usertype = req.body.usertype 

    try{
        correct_account = await Account.findOne({name: name}).exec()

    if (correct_account.name == name  && usertype == correct_account.usertype && usertype == 'user' && await bcrypt.compare(password, correct_account.hashedpw)) {
        session=req.session
        session.name = name
        res.redirect('/user')
        return
    }

    else if (correct_account.name == name &&  usertype == correct_account.usertype && usertype == 'admin' && await bcrypt.compare(password, correct_account.hashedpw)) {
        res.redirect('/auth/google')
        return
    }
    else {
        res.send('wrong user or password!')
    }}

    catch{
        res.send('wrong user or password!')
    }
})

//display create new account page
router.get('/new', (req,res) => {
    res.render('new.ejs')
})

//submitted create new account request
router.post('/new', async (req,res) => {
    name = req.body.name //do not use let again if you let name at top as a global. 
    //then it restricts into a local var, other route cant access
    //let name = req.body.name

    let password = req.body.password
    let usertype = req.body.usertype
    let hashpw = await bcrypt.hash(password, 10)

// -------------create DB account
    Account.create({
        name: name,
        password: password,
        hashedpw: hashpw,
        usertype: usertype}, (err) => {
//if the user already exist, use mongoose built in err => 
            if (err) {
                res.send('user/admin already exist!')}
            else {
// -------------valid username, pixela create account
console.log(process.env.Pixela_token)


let url = "https://pixe.la/v1/users"
let options = {
    method: 'POST',
    body: JSON.stringify({
        'token' : process.env.pixela_token, //maybe token need exclusive -.-
        'username' : name,   //process.env.VAR need close/open the edit after some time then update in OS
        "agreeTermsOfService":"yes",
        "notMinor":"yes"
    })
};
 
fetch(url, options)
.then(res => res.json())
.then(data => console.log(data, data.isSuccess)) //console.log(data)
//if data.isSuccess true then proceed, else false fail
console.log(name)

}  //end of else mongoose 
        })
        
//easier way to do this is write in a function. so neater abstraction sequence of steps seen.

res.redirect('/graph_create')
})
                

router.get('/graph_create', (req,res) => {
    console.log(name)

    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }
      
      // Usage!
      sleep(350).then(() => {
        console.log('sleep start', name)
          // Do something after the sleep!
          // ------------- pixela create graph
url = `https://pixe.la/v1/users/${name}/graphs`
options = {
    method: 'post',
    headers: { "X-USER-TOKEN":process.env.Pixela_token} , //header <s> SSSS omg.
    body: JSON.stringify({
        'id' : `${name}graph`,
        'name' : `${name}graph`,
        "unit":"characters",
        "type":"int",
        "color":"shibafu"
    })
};
//if data.isSuccess true then proceed, else false fail graph creation 
//how to fill this up for the user... just use a DB value counter create
fetch(url , options)
.then(res => res.json())
.then(data => console.log(data, data.isSuccess)) 

    res.redirect('/')
      });

})
 
 

router.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/')
})


//auth process -----------------------


//if pw correct, direct here
router.get('/auth/google',
    passport.authenticate('google', {scope: ['email', 'profile']})
)


router.get('/google/callback',
    passport.authenticate('google', {
    successRedirect: '/admin',
    failureRedirect: '/auth/failure',
    })
)

router.get('/auth/failure', (req,res) => {
    res.send('something went wrong..')
})





module.exports = router



