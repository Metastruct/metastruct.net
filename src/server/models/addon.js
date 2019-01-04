module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Addon", {
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        url: DataTypes.STRING(2100)
    }, { timestamps: false })
}