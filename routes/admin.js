const express = require('express')
const router = express.Router()
const app = express()

const Account = require('../models/Account')
const passport = require('passport')
const sessions = require('express-session')
require('./auth'); 


function isLoggedin(req,res,next) { next() }
//     req.user ? next() : res.sendStatus(401)
// }



router.get('/', isLoggedin, (req,res) => {
    res.render('./admin/admin.ejs')
})



router.get('/all_issues', isLoggedin, async (req,res) => {
    let all_user_issues = await Account.find().exec()  //rmb find() returns a LISTS
    res.render('./admin/all_issues.ejs',{all_user_issues:all_user_issues})
})

 
/////////////////////////////////////////

router.post('/comment', isLoggedin, async (req,res) => {
    let issue_data = req.body.comment
    issue_data = issue_data.split(',')
    console.log(issue_data)

    let issue_date = issue_data[0]
    let name =  issue_data[1]
    console.log(issue_date, name)

    let Comment_issue
    let Account_data = await Account.find() 
    
    Account_data.forEach( account => {
        let user_issues = account.issue
        user_issues.forEach(issue =>{
            if (issue.createdAt == issue_date) {
                Comment_issue = issue
            }
        })
    })

    let issue_title = Comment_issue.issue_title
    let description = Comment_issue.description
    let urgency = Comment_issue.urgency
    let updated_comment = Comment_issue.comment

     res.render('./admin/comment.ejs',  {issue_title: issue_title, description:description ,urgency:urgency, comment:updated_comment, issue_id:issue_date, name:name})
})
 

router.put('/comment', isLoggedin, async (req,res) => {
    let issue_id = req.body.id //the date created
    let name = req.body.name //user's issue
    let updated_comment = req.body.update_comment //new comment


    let comment_issue = []
    let issue_index 

    let Account_data = await Account.find()  //ALL account data here [(user, arr)]
    
    Account_data.forEach( account => {
        if (account.name != name) {return} 

        let user_issues = account.issue
        user_issues.forEach(issue =>{
            if (issue.createdAt == issue_id) {
                issue.comment = updated_comment}
            comment_issue.push(issue)
        })
    })

    //i have to replace the ENTIRE array. 
    
    await Account.findOneAndUpdate(
        { name: name }, 
        { issue: comment_issue}
        );
    res.redirect('/admin/all_issues')
})





router.get('/overview', isLoggedin, async (req,res) => {
    // chart.js here
    let Account_data = await Account.find()  //ALL account data here [(user, arr)]

    //urgency COUNT, then express as a pie chart
    let urgent_one  = 0
    let urgent_two = 0
    let urgent_three = 0

    let commented = 0
    let non_commented = 0
    
    Account_data.forEach(account => {
        user_issues = account.issue
        user_issues.forEach(issue => {
            switch (issue.urgency) {
                case '1':
                    urgent_one++;
                    break;
                case '2':
                    urgent_two++;
                    break;
                case '3':
                    urgent_three++;
                    break;
                }

                let issue_comment = issue.comment
                if (issue_comment == null || issue_comment.length === 0) {
                    non_commented++
                } else {
                    commented++
                }
    })
})

    console.log(urgent_one, urgent_two, urgent_three, commented, non_commented )


    res.render('./admin/overview.ejs', {urgent_one:urgent_one, urgent_two:urgent_two, urgent_three:urgent_three, commented:commented, non_commented:non_commented })
})


router.post('/overview', isLoggedin, (req,res) => {
    // filter option, then redirect overview
    let excluded_names = req.body.names 
    
    res.redirect('/admin/overview')
})


router.get('/logout', (req,res) => {
    // req.logout( ()=> null);
    // req.sessions.destroy()
    res.redirect('/')
})



module.exports = router


