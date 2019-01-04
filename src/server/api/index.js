module.exports = app => {
    const express = require("express")

    let api = express.Router()

    require("./addons.js")(api, app)
    require("./servers.js")(api, app)
    require("./history.js")(api, app)

    return api
}
