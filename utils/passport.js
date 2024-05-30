// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const db = require("../models");
// const UserModel = db.user;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8080/api/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Check if user already exists in the database based on email
//       UserModel.findOne({ email: profile.emails[0].value })
//         .then((existingUser) => {
//           if (existingUser) {
//             // User already exists, pass it to done callback
//             done(null, existingUser);
//           } else {
//             // User doesn't exist, create a new user in the database
//             new UserModel({
//               username: profile.displayName, // Map Google display name to username
//               email: profile.emails[0].value, // Map Google email to email field
//               // Omitting the password field for Google OAuth users
//             })
//               .save()
//               .then((newUser) => {
//                 done(null, newUser);
//               })
//               .catch((err) => {
//                 done(err, null);
//               });
//           }
//         })
//         .catch((err) => {
//           done(err, null);
//         });
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   UserModel.findById(id)
//     .then((user) => {
//       done(null, user);
//     })
//     .catch((err) => {
//       done(err, null);
//     });
// });

// module.exports = passport;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
const UserModel = db.user;

const { googleOAuthSignup } = require("../controllers/auth.controller.js");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/auth/google/callback",
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        req.profile = profile;
        await googleOAuthSignup(req, null, (err, newUser) => {
          if (err) {
            return done(err, null);
          }
          done(null, newUser);
        });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
