Build every screen below, each from its file in `.weave/04-pages/` into its route folder. You build them all in this session. When two screens share something, build it once, in `web/app/blocks/` or `web/app/components/`, and use it on both. When you are done, a user can do every step of every screen with the seed data. Each screen puts what the user came for first.

Read `.weave/01-scaffold/guidelines.md` first. It says what to read in each folder. Your folders are `.weave/01-scaffold/`, `.weave/02-contract/`, `.weave/03-frames/` and `.weave/04-pages/`. Follow every guideline in them.

Build the screens in the order below. Before you build each one, decide its layout from what it holds, as the guidelines say under Layout and emphasis. Check each screen with its command once it is built. The command checks the desktop width. On a page behind sign-in, it signs in as a member first.

## The screens

- S01 (Your day, all in one dashboard) at `/`, from `.weave/04-pages/S01.md`, in `web/app/(routes)/(marketing)`. Check it with `pnpm verify / --widths 1280`.
- S04 (Your dashboards) at `/dashboards`, from `.weave/04-pages/S04.md`, in `web/app/(routes)/(app)/dashboards`. Check it with `pnpm verify /dashboards --widths 1280 --storage .weave/02-contract/signed-in.json`.
- S05 (The dashboard's name) at `/dashboards/[dashboardId]`, from `.weave/04-pages/S05.md`, in `web/app/(routes)/(app)/dashboards/[dashboardId]`. Check it with `pnpm verify /dashboards/dashboard-1 --widths 1280 --storage .weave/02-contract/signed-in.json`.
