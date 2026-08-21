const request = require("request-promise-native");

// Live server/instance list per game, aggregated by metaconcord from the game
// bridges. /join/<name> redirects stay in redirects.js on config.gameservers.
module.exports = (api, app) => {
  const baseUrl = (app.config.metaconcord && app.config.metaconcord.url) || "";

  api.get("/servers", async (req, res) => {
    res.set("Cache-Control", "public, max-age=5, stale-while-revalidate=30, stale-if-error=600");
    if (!baseUrl) {
      res.status(503).json({ error: "metaconcord url not configured" });
      return;
    }

    try {
      const body = await request(`${baseUrl.replace(/\/$/, "")}/servers`, { timeout: 10000 });
      res.type("json").send(body);
    } catch (err) {
      console.error("failed to fetch servers from metaconcord:", err.message);
      res.status(502).json({ error: "metaconcord unavailable" });
    }
  });
};
