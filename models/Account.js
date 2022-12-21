const mongoose = require('mongoose')
const {Schema,model} = mongoose;
// const IssueSchema = require('./Issue') 


const AccountSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    password: String,
    hashedpw: String,
    usertype: String,
    issue: [{
        // type: mongoose.ObjectId,    have to figure out next time.
        // ref: 'Issue'                have .push error using that somehow.
        type: Object,
      }]
})


module.exports = mongoose.model('Account', AccountSchema)
