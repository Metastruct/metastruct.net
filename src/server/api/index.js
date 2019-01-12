module.exports = app => {
    const express = require("express")

    let api = express.Router()

    let blacklistedMethods = {
        POST: true,
        DELETE: true,
        PATCH: true,
        PUT: true,
    }

    api.use((req, res, next) => {
        res.set("Cache-Control", "public, max-age=5")

        if (blacklistedMethods[req.method] && (!req.user || !req.user.isAdmin)) {
            res.status(401)
            res.json({
                success: false
            })
            return false
        } else {
            return next()
        }
    })

    require("./addons.js")(api, app)
    require("./servers.js")(api, app)
    require("./history.js")(api, app)
    require("./auth.js")(api, app)

    return api
}
