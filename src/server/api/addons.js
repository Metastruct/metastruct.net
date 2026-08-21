const request = require("request-promise-native");

// Addon lists are aggregated by metaconcord from the game servers themselves
// (gserv repos, workshop, modrinth, curseforge). This only proxies them so the
// browser stays on one origin.
module.exports = (api, app) => {
  const baseUrl = (app.config.metaconcord && app.config.metaconcord.url) || "";

  api.get("/addons", async (req, res) => {
    res.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600, stale-if-error=86400"
    );
    if (!baseUrl) {
      res.status(503).json({ error: "metaconcord url not configured" });
      return;
    }

    try {
      const body = await request(`${baseUrl.replace(/\/$/, "")}/addons`, { timeout: 10000 });
      res.type("json").send(body);
    } catch (err) {
      console.error("failed to fetch addons from metaconcord:", err.message);
      res.status(502).json({ error: "metaconcord unavailable" });
    }
  });
};
