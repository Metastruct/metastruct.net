# metastruct.net

> Website for the Meta Construct community

Static Nuxt 4 site. Everything dynamic (server list, add-ons, GitHub login, history editing, `/join` and short links) is served by [node-metaconcord](https://github.com/Metastruct/node-metaconcord). The history timeline lives in `history.json` in the [Metastruct/history](https://github.com/Metastruct/history) repo, served and edited through metaconcord.

## Build Setup

Uses [pnpm](https://pnpm.io) (`npm i -g pnpm`, or `corepack enable`).

```bash
# install dependencies
$ pnpm install

# dev server at localhost:20000, proxies /mc/* to metaconcord
$ pnpm dev

# generate the static site into .output/public/
$ pnpm build

# lint
$ pnpm lint
```

## Config

Environment variables, read at build time (see `.env.example`):

- `METACONCORD_URL`: metaconcord base URL, default `https://metaconcord.metastruct.net`
- `MC_SESSION`: dev only, see below

### Logging in on the dev server

Metaconcord scopes its session cookie to `.metastruct.net` and marks it `Secure`, and its
OAuth callback always returns to the production site, so localhost cannot obtain a session
of its own. To test logged-in features, borrow one: log in on https://metastruct.net, copy
the `ghSession` cookie value out of devtools, and put it in `.env` as `MC_SESSION`. The dev
proxy attaches it to every `/mc` request.

This is a real session against production metaconcord. Writes from dev (creating or editing
bans, editing history) change live data. The session expires after 8 hours; logging out from
the dev UI does nothing, since the proxy keeps re-sending the cookie.

Pushes to `master` build and deploy `.output/public/` to GitHub Pages through `.github/workflows/deploy.yml`. `public/CNAME` sets the custom domain.
