const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const consola = require("consola");

module.exports = async app => {
  const sequelize = new Sequelize({
    database: app.config.postgres.database,
    username: app.config.postgres.username,
    password: app.config.postgres.password,
    host: app.config.postgres.host,
    port: app.config.postgres.port,
    dialect: "postgres",
    logging: false,
    // logging: console.log,

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: "0",
  });

  fs.readdirSync(path.join(__dirname, "models")).forEach(file => {
    const filePath = path.join(__dirname, "models", file);
    if (fs.statSync(filePath).isFile() && path.extname(filePath) === ".js") {
      require(filePath)(sequelize, DataTypes);
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

  return { sequelize };
};
