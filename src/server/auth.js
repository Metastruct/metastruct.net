const passport = require("passport")
const SamlStrategy = require("passport-saml").Strategy
const SteamAPI = require("steamapi")
const request = require("request-promise-native")
const xml2js = require("xml-js").xml2js

module.exports = app => {
    app.passport = passport
    let steam = app.steam = new SteamAPI(app.config.steam.apiKey)

    app.use(passport.initialize())
    app.use(passport.session())

    if (process.env.NODE_ENV !== "production") {
        app.use((req, res, next) => {
            req.user = {
                steamID: "123456",
                nickname: "Tenrys - debug",
                isAdmin: true
            }

            return next()
        })
    }

    const adminsList = "https://steamcommunity.com/gid/103582791433481287/memberslistxml?xml=1"

    async function getUserInfo(steamId) {
        let user = await steam.getUserSummary(steamId)

        let admins = (await request(adminsList)).match(user.steamID)
        user.isAdmin = admins ? true : false

        return { ...user }
    }

    passport.serializeUser((user, done) => {
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

        console.log(`'${user.nickname}' logged in ${user.isAdmin ? 'as admin' : ''}.`)

        return done(null, user)
    }))

    app.get("/auth", (req, res, next) => {
        req.session = req.session || {}
        req.session.authRedirect = req.query.redirect

        return next()
    }, passport.authenticate("saml"))
    app.post("/auth/callback", passport.authenticate("saml"), (req, res) => {
        if (req.session && req.session.authRedirect) {
            res.redirect("/" + req.session.authRedirect)
            delete req.session.authRedirect
        } else {
            res.redirect("/")
        }
    })

    app.get("/auth/info", (req, res) => {
        if (req.user) {
            res.json(req.user)
        } else {
            res.status(401)
            res.json({})
        }
    })
}
