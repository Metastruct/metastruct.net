const redirects = {
  loadingscreen: "https://loadingscreen.metastruct.net/",
  gallery: "https://loadingscreen.metastruct.net/",
  gitlab: "https://gitlab.com/metastruct",
  github: "https://github.com/metastruct",
  msdnaa: "https://www3.metastruct.net/msdnaa",
  rocket: "https://www3.metastruct.net/rocket2",
  rocket2: "https://www3.metastruct.net/rocket2",
  discord: "https://discord.gg/CHuxFSd",
  re: "https://g2cf.metastruct.net/reauth",
};
const joinURLs = {
  // This is separate from config.gameservers, apparently
  eu1: "195.154.166.219:27015",
  eu2: "176.9.65.121:27015",
  eu3: "116.202.33.7",
  us1: "66.42.103.116:27015",
  hl2coop: "94.23.170.2:27016",
  hl2dm: "94.23.170.2:27015",
};

module.exports = app => {
  for (const [name, url] of Object.entries(redirects)) {
    console.log("Added redirect for " + name + " at " + url);
    app.get(`/${name}`, (req, res) => {
      res.redirect(url);
    });
  }
  for (const [id, hostname] of Object.entries(joinURLs)) {
    console.log("Added join URL for " + id + " at " + hostname);
    app.get(`/join/${id}/:pwd?`, (req, res) => {
      const pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g, "");
      res.redirect(`steam://connect/${hostname}/${pwd}`);
    });
  }
};
