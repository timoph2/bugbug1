const mongoose = require('mongoose')
const {Schema,model} = mongoose;


const IssueSchema = new Schema({
    issue_title: String,
    description: String,
    urgency: Number,
    comment: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now    //interesting, save this not as now() function. 
      }                      //because mongoose will run it again when creating, hence save fx not call it. 
})                           //but outside of mongoose default, need call Date() instead


 
module.exports = mongoose.model('Issue', IssueSchema)
















