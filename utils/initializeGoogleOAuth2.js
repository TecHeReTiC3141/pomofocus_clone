const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = "456606812667-29ucql80qgv4hma1q872m99e7cq4ee4u.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET = "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";

const { User } = require('../models/User');

async function initializeOAuth2(passport) {

    async function authenticateUser(request, accessToken, refreshToken, profile, done) {
        const [user, created] = await User.findOrCreate({
            where: {googleId: profile.id},
            defaults: {
                email: profile.email,
                name: profile.displayName,
                avatar: profile.photos && profile.photos[0].value,
            }
        });
        return done(null, user.toJSON());
    }
    passport.use(new GoogleStrategy({
            clientID:     GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/users/google/callback",
            passReqToCallback   : true
        },
        authenticateUser
    ));

    passport.serializeUser((user, done) => done(user.id));
    passport.deserializeUser(async (id, done) =>
        done((await User.findByPk(id)).toJSON()));
}

module.exports = initializeOAuth2;
