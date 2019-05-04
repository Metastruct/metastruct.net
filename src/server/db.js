const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = async app => {
    const sequelize = new Sequelize({
        database: app.config.postgres.database,
        username: app.config.postgres.username,
        password: app.config.postgres.password,
        host: app.config.postgres.host,
        port: app.config.postgres.port,
        dialect: "postgres",
        logging: false,

        // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
        operatorsAliases: false,
    });

    let models = {};
    fs.readdirSync(path.join(__dirname, "models")).forEach(file => {
        let filePath = path.join(__dirname, "models", file);
        if (fs.statSync(filePath).isFile() && path.extname(filePath) === ".js") {
            let model = sequelize.import(filePath);
            models[model.name] = model;
        }
    });

    await sequelize
        .sync()
        .then(() => {
            consola.ready({
                message: `Connected to database at ${app.config.postgres.username}@${app.config.postgres.host}`,
                badge: true,
            });
        })
        .catch(console.error.bind(console, "Connection error:"));

    return { models, sequelize };
};
