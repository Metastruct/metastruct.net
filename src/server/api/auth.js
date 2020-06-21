module.exports = (api, app) => {
	api.get("/auth", (req, res) => {
		if (req.user) {
			res.json(req.user);
		} else {
			res.status(401);
			res.json({});
		}
	});
};
