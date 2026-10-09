# Roblox Pulse
A Vercel-ready Roblox game dashboard. Real public API data: concurrent players (CCU), lifetime visits, favourites, like ratio, game icons, device history, game filtering, range selection and CSV export. No dependencies or Roblox cookie required. Break the Piggy Bank is preloaded from its place ID, 86560821736864.

## Publish to your .vercel.app address
1. Extract this ZIP. Upload the contents of `roblox-pulse` to a GitHub repository (package.json and vercel.json should be at its root).
2. On https://vercel.com/new, import that repository.
3. Select **Other** for framework. Leave build and install commands empty; output directory is **public**. Deploy.
4. Vercel gives you a `.vercel.app` URL. Open it and add game links.

The website is public by default. It only shows public Roblox stats. Your added-game list is stored on your device, not a shared account. A new device starts with the default Piggy Bank game.

## Live tracking
The page fetches fresh stats every 60 seconds while visible. Roblox may cache or delay its own numbers. History begins when collection starts; historical data cannot be backfilled. The chart shows observed data only, with gaps rather than invented samples. Portfolio totals use matching observation minutes for all currently tracked games. Observed peak respects the selected chart time range and is a sampled peak, not an all-time Roblox record. Revenue and retention are private creator metrics and are not part of this public API dashboard.

## Optional: history while the page is closed
Without a database, history is only recorded while this page is open and saved in this browser. For durable server history:
1. Create an Upstash Redis database, or add the Upstash Redis integration from Vercel Marketplace.
2. In Vercel Project Settings → Environment Variables, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database REST API details. Keep these server-side; never paste them into frontend files.
3. Set `CRON_SECRET` to a long random secret (at least 32 random characters).
4. Set `TRACKED_PLACE_IDS` to comma-separated Roblox **place** IDs. The default is `86560821736864`. Maximum 20. Games added in the UI must also be listed here if you want background history for them.
5. Redeploy. The included Vercel cron runs daily at midnight UTC (free-plan execution may be up to 59 minutes later). Daily samples are sparse, not continuous CCU tracking.
6. For collection every 5 minutes, either change the cron schedule in vercel.json to `*/5 * * * *` on a supported Vercel plan, or use an external scheduler to GET `https://YOUR-DOMAIN.vercel.app/api/collect` every 5 minutes with the HTTP header `Authorization: Bearer YOUR_CRON_SECRET`. Never put the secret in the URL. Keep only one schedule if duplicate collection is undesired.

Vercel Hobby restricts built-in cron jobs to daily execution. Check current plan limits at https://vercel.com/docs/cron-jobs/usage-and-pricing before changing the frequency. This project does not provision a database or scheduler for you. Database/scheduler usage may incur fees according to the provider's plan.

Server history is retained for 30 days. Only configured games are written to the database; any public game can be queried live. History retrieval failure does not prevent displaying live stats. Browser CSV export includes history loaded onto that device. Sampling within the same minute is bucketed; overlapping server calls can occasionally create duplicate members in Redis, which the UI deduplicates by minute.

## Local use and checks
Use Node.js 22 or newer. Run `npm run dev`, then open http://localhost:3000. No npm install is required. For local database variables use `node --env-file=.env dev.mjs` after copying .env.example to .env. Run `npm test` and `npm run check`.

## Files
- public/: dashboard UI
- api/stats.js: Roblox stats proxy and optional history retrieval
- api/collect.js: authenticated background collector
- lib/: Roblox and Redis connections
- vercel.json: deployment config and daily cron

## Quick acceptance check
Add a known Roblox game link. Confirm its name and live stats load, wait for a second update, confirm a chart observation appears, export CSV, and reload to confirm your game list is retained. Invalid links should show an inline error. If Roblox is unavailable, the dashboard must show a connection error and keep its last successful data.

## Validation limits
Automated tests exercise API validation, ID resolution, metric mapping, unavailable optional metrics, and collector authentication using mocked upstream requests. Visual browser QA was unavailable because no browser executable is installed. Live upstream requests and Vercel deployment must be checked after deployment because this build environment cannot reach those services directly.
