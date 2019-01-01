const Sequelize = require("sequelize")
const fs = require("fs")
const path = require("path")

module.exports = app => {
    const sequelize = new Sequelize(app.config.database, app.config.username, app.config.password, {
        host: app.config.host,
        dialect: "postgres",

        // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
        operatorsAliases: false
    })

    let models = {}
    fs.readdirSync(path.join(__dirname, "models")).forEach(file => {
        let filePath = path.join(__dirname, "models", file)
        if (fs.statSync(filePath).isFile() && path.extname(filePath) === ".js") {
            let model = sequelize.import(filePath)
            models[model.name] = model
        }
    })

    return { models, sequelize }
}