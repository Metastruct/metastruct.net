# metastruct.net

![](https://tenrys.pw/ShareX/2019/Jan/3AkJ.png)

> Website for the Meta Construct community

Static Nuxt 4 site. Everything dynamic (server list, add-ons, GitHub login, history editing, `/join` and short links) is served by [node-metaconcord](https://github.com/Metastruct/node-metaconcord). The history timeline lives in `history.json` in the [Metastruct/history](https://github.com/Metastruct/history) repo, served and edited through metaconcord.

## Build Setup

Uses [pnpm](https://pnpm.io) (`npm i -g pnpm`, or `corepack enable`).

```bash
# install dependencies
$ pnpm install

# dev server at localhost:20000, proxies /mc/* to metaconcord so login cookies work locally
$ pnpm dev

# generate the static site into .output/public/
$ pnpm build

# lint
$ pnpm lint
```

## Config

Environment variables, read at build time (see `.env.example`):

- `METACONCORD_URL`: metaconcord base URL, default `https://metaconcord.metastruct.net`

Pushes to `master` build and deploy `.output/public/` to GitHub Pages through `.github/workflows/deploy.yml`. `public/CNAME` sets the custom domain.
