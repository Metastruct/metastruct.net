const passport = require("passport")
const SamlStrategy = require("passport-saml").Strategy
const SteamAPI = require("steamapi")

module.exports = app => {
    app.passport = passport
    let steam = app.steam = new SteamAPI(app.config.steam.apiKey)

    app.use(passport.initialize())
    app.use(passport.session())

    async function getUserInfo(steamId) {
        let user = await steam.getUserSummary(steamId)
        let groups = await steam.getUserGroups(steamId)

        user.groups = groups
        user.isAdmin = groups.includes("3959879")

        return user
    }

    passport.serializeUser((user, done) => {
        console.log(user)

        let steamId = user.steamID

        done(null, steamId);
    })
    passport.deserializeUser(async (steamId, done) => {
        let user = await getUserInfo(steamId)

        done(null, user)
    })

    passport.use(new SamlStrategy({
        callbackUrl: "/auth/callback",
        entryPoint: app.config.saml.entryPoint,
        issuer: "metastructnet-passport-saml"
    }, async (profile, done) => {
        let steamId = profile.openid.match(/\/(\d+)$/)[1]

        let user = await getUserInfo(steamId)

        return done(null, user)
    }))

    app.get("/auth", passport.authenticate("saml"))
    app.post("/auth/callback", passport.authenticate("saml"), (req, res) => {
        res.redirect("/")
    })

    app.get("/auth/info.json", (req, res) => {
        if (req.user) {
            res.json(user)
        } else {
            res.status(401)
            res.json({})
        }
    })
}
