const express = require('express')
const router = express.Router()
const Account = require('../models/Account') 
const fetch = (...args) =>
    import('node-fetch').then(({default:fetch}) => fetch(...args)) // npm install node-fetch
//^need import in router itself, not in main app.js


router.get('/', (req,res) => {
    let name = session.name
    Graph_link = `https://pixe.la/v1/users/${name}/graphs/${name}graph.html`
    console.log(Graph_link)

    res.render('./user/user.ejs', {user:name, Graph_link:Graph_link}) 
    // res.render('./user/user.ejs', {user:name}, {Graph_link:Graph_link})
    //                                          ^... omg key-values within same dict pls. 
})



// router.get('/:user', (req,res) => {
//     res.render('./user/user.ejs')
// })

router.get('/submit', (req,res) => {
    res.render('./user/submit.ejs')
})

router.post('/submit', async (req,res) => {
    let issue_title = req.body.issue_title
    let description = req.body.description
    let urgency = req.body.urgency 
    let createdAt = Date()  // Date.now() in mongoose returns that Date() 
 
    let issue = {                                  //i need to append this create into author, then issue sub doc
        issue_title: issue_title,                  // so the issues table not exist.
        description:description,                   
        urgency: urgency,
        createdAt: createdAt
    }
    let name = session.name

    await Account.findOneAndUpdate(
        { name: name }, 
        { $push: { issue: issue } }
    );


    //creating initial pixela 
    let description_length = String(description.length) 
    console.log(description_length)

    const date = new Date()
    const year = date.getFullYear()
    let month = ('0' + (date.getMonth() + 1)).substring(-2) //substring to check/remove extra digit 0
    month = month.substring(month.length - 2)
    let day = ('0' + date.getDate()).substring(-2)
    day = day.substring(day.length - 2)
    const dateStr = [year, month, day].join('') //YYYYmmDD format
    console.log(dateStr)

    let url = `https://pixe.la/v1/users/${name}/graphs/${name}graph` ///v1/users/<username>/graphs/<graphID>

    let options = {
        method: 'POST',
        headers: { "X-USER-TOKEN":process.env.Pixela_token} , //header <s> SSSS omg.
        body: JSON.stringify({
            'date' : dateStr, //maybe token need exclusive -.-
            'quantity' : description_length,   //process.env.VAR need close/open the edit after some time then update in OS
        })
    };
    
    fetch(url, options)
    .then(res => res.json())
    .then(data => console.log(data)) //console.log(data)
    //if data.isSuccess true then proceed, else false fail





    res.redirect('/user') 
})



router.get('/issues', async (req,res) => {
    let name = session.name
    let current_account = await Account.findOne({name:name}).exec()  //rmb find() returns a LISTS
    let issues = current_account.issue

    res.render('./user/view.ejs',{issues:issues}) 
})



router.delete('/issues', async (req,res) => {
    let issue_date = req.body.delete
    // await Issue.findByIdAndDelete(issue_id)

    let Account_data = await Account.findOne({name:session.name})
    let Account_issues = Account_data.issue
    let Removed_issues = Account_issues.filter( issue => {
        return issue.createdAt !== issue_date
    })

    await Account.findOneAndUpdate({name: session.name}, {issue: Removed_issues})


    //deleting pixela 
 

    // const datestr = issue_date
    // console.log(datestr)
    // const year = date.getFullYear()
    // let month = ('0' + (date.getMonth() + 1)).substring(-2) //substring to check/remove extra digit 0
    // month = month.substring(month.length - 2)
    // let day = ('0' + date.getDate()).substring(-2)
    // day = day.substring(day.length - 2)
    // const dateStr = [year, month, day].join('') //YYYYmmDD format
    // console.log(dateStr)

    // let url = `https://pixe.la/v1/users/${name}/graphs/${name}graph/${dateStr}` ///v1/users/<username>/graphs/<graphID>

    // let options = {
    //     method: 'POST',
    //     headers: { "X-USER-TOKEN":process.env.Pixela_token} , //header <s> SSSS omg.
    //     body: JSON.stringify({
    //         'date' : dateStr, //maybe token need exclusive -.-
    //         'quantity' : description_length,   //process.env.VAR need close/open the edit after some time then update in OS
    //     })
    // };
    
    // fetch(url, options)
    // .then(res => res.json())
    // .then(data => console.log(data)) //console.log(data)
    // //if data.isSuccess true then proceed, else false fail


    res.redirect('/user/issues')
})



router.post('/edit', async (req,res) => {
    let issue_date = req.body.edit

    let Account_data = await Account.findOne( {name:session.name} )
    let Account_issues = Account_data.issue //array

    let Edit_issue = Account_issues.filter( issue => {
        return issue.createdAt === issue_date
    })
    Edit_issue = Edit_issue[0]

    let issue_title = Edit_issue.issue_title
    let description = Edit_issue.description
    let urgency = Edit_issue.urgency
    let comment = Edit_issue.comment

    //await Promise.all([fx1, fx2, fx3]) to run parrallel
    res.render('./user/update.ejs', {issue_title: issue_title, description:description ,urgency:urgency, comment:comment, issue_id:issue_date})
})


router.put('/edit', async (req,res) => {
    let updated_issue_title = req.body.issue_title
    let updated_description = req.body.description
    let updated_urgency = req.body.urgency
    let updated_createdAt = Date()

    let issue_id = req.body.id
 
    let updated_issue = {   
        issue_title: updated_issue_title,
        description:updated_description,
        urgency: updated_urgency,
        createdAt: updated_createdAt
    }

    let Account_data = await Account.findOne( {name:session.name} )
    let Account_issues = Account_data.issue //Array of objects(issue)

    let Deleted_issue = Account_issues.filter( issue => {
        return issue.createdAt !== issue_id
    })
    //ok somehow an array is being created & pushed into the array.
    // $push this pushes into the nested array directly, but here i want
    // to delete the old array entirely so i push outside.
    
    Deleted_issue.push(updated_issue)

    await Account.findOneAndUpdate(
    { name: session.name }, 
    { issue: Deleted_issue }
    );

    // //updating pixela 
    // let description_length = String(description.length) 
    // console.log(description_length)

    // const date = new Date()
    // const year = date.getFullYear()
    // let month = ('0' + (date.getMonth() + 1)).substring(-2) //substring to check/remove extra digit 0
    // month = month.substring(month.length - 2)
    // let day = ('0' + date.getDate()).substring(-2)
    // day = day.substring(day.length - 2)
    // const dateStr = [year, month, day].join('') //YYYYmmDD format
    // console.log(dateStr)

    // let url = `https://pixe.la/v1/users/${name}/graphs/${name}graph` ///v1/users/<username>/graphs/<graphID>

    // let options = {
    //     method: 'POST',
    //     headers: { "X-USER-TOKEN":process.env.Pixela_token} , //header <s> SSSS omg.
    //     body: JSON.stringify({
    //         'date' : dateStr, //maybe token need exclusive -.-
    //         'quantity' : description_length,   //process.env.VAR need close/open the edit after some time then update in OS
    //     })
    // };
    
    // fetch(url, options)
    // .then(res => res.json())
    // .then(data => console.log(data)) //console.log(data)
    //if data.isSuccess true then proceed, else false fail


    res.redirect('/user/issues')
})



module.exports = router
