const { use } = require('passport');
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;


client_id =  process.env.google_client_id  
client_secret = process.env.google_secret 


passport.use(new GoogleStrategy({
    clientID: client_id,         //GOOGLE_CLIENT_ID,  
    clientSecret: client_secret, //GOOGLE_CLIENT_SECRET 
    callbackURL: "http://localhost:3003/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ googleId: profile.id }, function (err, user) { //this is where u put DB credentials
      // return done(err, profile);
      return done(null, profile); //should be err if user is defined
  }
));


passport.serializeUser( (user,done) => {
  done(null, user) //null = err if no match
})

passport.deserializeUser( (user,done) => {
  done(null, user) //null = err if no match
})

//https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
//to understand de/serializeUser