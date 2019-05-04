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
    app.get(`/join/eu1/:pwd`, (req, res) => {
        let pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g,"")
        res.redirect("steam://connect/g1.metastruct.net:27015/"+pwd)
    })
    app.get(`/join/eu2/:pwd`, (req, res) => {
        let pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g,"")
        res.redirect("steam://connect/g2.metastruct.net:27018/"+pwd)
    })
    app.get(`/join/hl2coop/:pwd`, (req, res) => {
        let pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g,"")
        res.redirect("steam://connect/g2.metastruct.net:27016/"+pwd)
    })
    app.get(`/join/hl2dm/:pwd`, (req, res) => {
        let pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g,"")
        res.redirect("steam://connect/g2.metastruct.net:27015/"+pwd)
    })

}
