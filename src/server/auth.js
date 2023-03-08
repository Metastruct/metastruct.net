const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const SteamAPI = require("steamapi");
const request = require("request-promise-native");

module.exports = app => {
  app.passport = passport;
  const steam = (app.steam = new SteamAPI(app.config.steam.apiKey));

  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      req.user = {
        steamId: "123",
        nickname: "debug",
        isAdmin: true,
      };

      return next();
    });
  }

  const adminsList = "https://steamcommunity.com/gid/103582791433481287/memberslistxml?xml=1";

  async function getUserInfo(steamId) {
    const user = await steam.getUserSummary(steamId);
    user.steamId = user.steamID;
    delete user.steamID;

    const admins = (await request(adminsList)).match(user.steamId);
    user.isAdmin = !!admins;

    return { ...user };
  }

  passport.serializeUser((user, done) => {
    const steamId = user.steamId;

    done(null, steamId);
  });
  passport.deserializeUser(async (steamId, done) => {
    const user = await getUserInfo(steamId);

    done(null, user);
  });

  passport.use(
    new SamlStrategy(
      {
        path: "/auth/callback",
        entryPoint: app.config.saml.entryPoint,
        issuer: "passport-saml",
        cert: "fake cert"
      },
      async (profile, done) => {
        const steamId = profile.openid.match(/\/(\d+)$/)[1];

        const user = await getUserInfo(steamId);

        console.log(`'${user.nickname}' logged in${user.isAdmin ? " as admin" : ""}.`);

        return done(null, user);
      }
    )
  );

  function getRoutePath(name) {
    switch (name) {
      case "index":
        return "";
      default:
        return name;
    }
  }
  app.get(
    "/auth",
    (req, res, next) => {
      req.session = req.session || {};
      req.session.authRedirect = req.query.redirect;

      return next();
    },
    passport.authenticate("saml")
  );
  app.post("/auth/callback", passport.authenticate("saml"), (req, res) => {
    if (req.session && req.session.authRedirect) {
      res.redirect("/" + getRoutePath(req.session.authRedirect));
      delete req.session.authRedirect;
    } else {
      res.redirect("/");
    }
  });
  app.get("/auth/logout", req => {
    req.logout();
  });
};
