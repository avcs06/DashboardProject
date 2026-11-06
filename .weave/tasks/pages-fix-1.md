The checks after your work, and the reviewers who read your change, found the issues below. Fix them in the code you wrote for this unit.

You built this unit earlier in this session, so you know what you changed. You need no git history. Your guidelines are in `.weave/01-scaffold/guidelines.md` and in these folders: `.weave/01-scaffold/`, `.weave/02-contract/`, `.weave/03-frames/`, `.weave/04-pages/`. Read one again only when you need a detail you no longer have.

Each issue below is a failed check, or a reviewer's finding with the fix it asks for. Fix each one, and keep everything else as it is. End with the summary the guidelines ask for.

## Your replies

Each issue below has an id, such as T01, and the replies given on it in earlier rounds. Each line under an issue is one reply, oldest first: its round, who gave it, its status and its reason. `fix` is you, in an earlier round. `review-<name>` is a reviewer. When a reviewer answered your reason, answer that reviewer's point.

When you finish, write `.weave/replies.json` with one reply per issue:

```json
[
  { "id": "T01", "status": "closed", "reason": "Moved the Edit button into the page header." },
  { "id": "T02", "status": "open", "reason": "T01 moves the same button; the header is where the user looks for it." }
]
```

- `closed` when you fixed it. Say what you changed.
- `open` when you did not fix it. Give your reason in one or two sentences.

## When you leave an issue open

Fix every issue. Leave an issue `open` only in one of three cases:

- Its fix would break an instruction you were given: your task, the guidelines, `UX.md` or the design. Quote that instruction in your reason.
- It asks for the opposite of another issue, such as one that moves a link and one that keeps it where it is. Fix the one that serves the user better. In the other's reason, name the one you fixed.
- Its fix would bring in a new error, such as a failed check, a step that stops working or a screen that breaks. Name what would break.

Taste, or a fix that is hard or long, is no reason to leave an issue open. For example, "The guidelines say the way up to a list is the breadcrumb, so I added no back link" is a reason. "The current layout looks cleaner" is not: fix the issue.

A failed check you answer `open` is not sent to you again. The reviewers read your replies when they review this fix. They accept a reason that quotes an instruction, names the opposite issue you fixed, or names what the fix would break. They answer any other reason `open`.

## How the checks ran

- An issue that names a route, such as `/:`, comes from a browser check the runner ran on that route after you finished. `pnpm verify` does not run it, and you cannot run it yourself. Fix it from the code. Start no dev server, and write no browser scripts.
- Each of those issues names its element by a CSS path, such as `main > form > button:nth-of-type(2)`. Find that element in your code.
- When you finish, the runner runs every check again.

## The issues

- T01: REVIEW at web/app/(routes)/(app)/dashboards/page.tsx: The screen reads browser storage directly with localStorage.getItem instead of the entity layer. Fix: Remove the localStorage read for dashboards:lastEdited and derive the last-edited dashboard only through listDashboards/getDashboard hooks or entity-layer state.
- T02: REVIEW at web/app/(routes)/(app)/dashboards/[dashboardId]/page.tsx: The screen writes browser storage directly with localStorage.setItem instead of the entity layer. Fix: Remove the localStorage write for dashboards:lastEdited from the screen and keep any cross-view last-edited state in the entity layer's store.
- T03: REVIEW at web/app/(routes)/(app)/dashboards/page.tsx: The last-edited gone alternative shows while the record is still loading because lastDashboard===undefined is treated as gone without checking loading. Fix: Show the gone state only when the stored last-edited id is known to be missing (storedGone); while useGetDashboard for the last dashboard is still loading show loading, and on its error show an error with retry, never the gone message.
- T04: REVIEW at web/app/(routes)/(app)/dashboards/[dashboardId]/page.tsx: Checklist and link-list empty messages can show while those records are still loading because items and links loading and error are ignored. Fix: Load checklist items and links with their loading and error states; show loading while they load and an error with retry on failure, and show No items yet. and No links yet. only after their loads succeed with zero rows.
- T05: REVIEW at S05 D01, D02, D09, D10: Delete and remove failure and already-gone alternatives are only toasts after the confirm dialog closed instead of dialog states with retry and Close. Fix: Build the failure alternative inside the confirm dialog that keeps what was typed and offers Delete to retry and Cancel to close, and the already-gone alternative inside the dialog that reads the record is already gone with Close that routes to /dashboards for D01 and shows the dashboard without the record for D02/D09/D10.
- T06: REVIEW at web/app/(routes)/(app)/dashboards/[dashboardId]/page.tsx: The widgets list of records is a hand-built div of Cards instead of a Table or CardList. Fix: Render the ordered widgets as a CardList of WidgetCards instead of a div of Cards built by hand.
- T07: REVIEW at web/app/(routes)/(app)/dashboards/[dashboardId]/components/ConfigureWidgetDialog.tsx: Save has no loading, disabled, or busy guard so a second press while saving runs the updates again. Fix: Disable the Save button while the save runs and guard the save so a second press does nothing, e.g. tie loadingWithReason/disabledWithReason to formState.isSubmitting.
- T08: REVIEW at web/app/(routes)/(app)/dashboards/[dashboardId]/components/LinkDialog.tsx: Save has no loading, disabled, or busy guard so a second press while saving can create or update the link twice. Fix: Disable the Save button while the save runs and guard the save so a second press does nothing, e.g. tie loadingWithReason/disabledWithReason to formState.isSubmitting.
- T09: REVIEW at web/app/blocks/WidgetCard/WidgetCard.tsx: A link address from a record is rendered as a clickable Link without checking for http/https, allowing javascript: URLs. Fix: Check link.webAddress protocol before rendering as a link and only use Link for http: or https: (or app route), otherwise render plain text.
- T10: REVIEW at web/app/(routes)/(app)/dashboards/page.tsx: The page treats an undefined lastDashboard as gone without checking its loading state, showing gone while it is still loading. Fix: Wait for useGetDashboard loading to finish before deciding the last dashboard is gone; show loading until known and only show gone when loading is false and data is undefined.
- T11: REVIEW at S01 at web/app/(routes)/(marketing)/page.tsx: The hero preview renders four widgets with size tags and Last edited captions the design does not ask for, exceeding the three-at-most preview limit. Fix: Show at most three widgets in the Hero media, with only the title and content the design names and without size Tags or Last edited captions.
- T12: REVIEW at S05 and S01 at web/app/blocks/WidgetCard/WidgetCard.tsx: The size Tag shows the stored value as kept, such as medium, small or large in lowercase. Fix: Display the widget size as a human label such as Small, Medium or Large instead of the stored lowercase value.
