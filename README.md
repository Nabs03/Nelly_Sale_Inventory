# Sweet Crumb Inventory

Mobile-first food inventory and sales tracking app built with React, Vite, Express, and libSQL.

## Local development

Install dependencies and run the frontend and API in separate terminals:

```sh
npm install
npm run server
npm run dev
```

The local API stores data in `data/inventory.db`. Starter records are only
created when `SEED_STARTER_DATA=true`; by default, a new database starts empty.

## Vercel deployment

Import `Nabs03/Nelly_Sale_Inventory` into Vercel and add these server-side
environment variables to the project:

- `TURSO_DATABASE_URL`: the Turso database URL.
- `TURSO_AUTH_TOKEN`: a token for that database.

Create a Turso database, then deploy the project. Vercel builds the Vite app
into `dist` and serves the Express API as a function. Never add database
credentials to source control or expose them through `VITE_` variables.

The remote database is initialized automatically and starts empty. To copy the
existing local inventory and retained sales history, link this project with the
Vercel CLI, pull the configured environment variables into the ignored
`.env.local` file, then run:

```sh
vercel env pull .env.local
node --env-file=.env.local scripts/import-local-db-to-turso.js
```

The import stops if the remote database already contains records.

## Checks

```sh
npm test
npm run build
npx tsc --noEmit
```
