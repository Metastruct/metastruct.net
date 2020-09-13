module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		"Addon",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: DataTypes.STRING,
			description: DataTypes.TEXT,
			url: DataTypes.STRING(2100),
			order: DataTypes.INTEGER,
		},
		{ timestamps: false }
	);
};
