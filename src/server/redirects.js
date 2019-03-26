let redirects = {
    gallery: "https://loadingscreen.metastruct.net/",
    msdnaa: "https://www3.metastruct.net/msdnaa",
    rocket: "https://www3.metastruct.net/rocket",
    rocket2: "https://www3.metastruct.net/rocket2",
    discord: "https://discord.gg/CHuxFSd",
    webchat: "https://www3.metastruct.net/webchat",
}

module.exports = app => {
    for (const name in redirects) {
        if (redirects.hasOwnProperty(name)) {
            const url = redirects[name]

            console.log("Added redirect for " + name + " at " + url)
            app.get(`/${name}`, (req, res) => {
                res.redirect(url)
            })
        }
    }
}
