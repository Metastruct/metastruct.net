module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		"HistoryEvent",
		{
			date: DataTypes.DATE,
			name: DataTypes.STRING,
			description: DataTypes.TEXT,
			url: DataTypes.STRING(2100),
			imageUrl: DataTypes.STRING(2100),
		},
		{ timestamps: false }
	);
};
