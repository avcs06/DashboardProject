# Frames

## FR01 Public site frame (frame)
Surrounds the public landing page so a visitor can recognise the app, sign in, and start toward signing up.
Flows: F01, F03

1. Sees the logo, which leads to /.
2. Can choose "Sign in", which goes to /sign-in.

When the visitor is signed in:
   1. Sees the logo, which leads to /.
   2. Can open the account menu, which shows their name and lets them open their dashboards at /dashboards or sign out to /.

Route group: `web/app/(routes)/(marketing)/`. Screens inside it: S01 /, S02 /sign-up, S03 /sign-in.
Loads its records through: nothing.

## FR02 App frame (frame)
Surrounds the signed-in screens, holds the member's dashboard list at all times, and gives them Create and their account menu wherever they work.
Flows: F04, F05, F06, F07, F08, F09, F10

1. Sees the logo, which leads to /dashboards.
2. Can choose "Create", the main action, which creates a dashboard named 'Untitled dashboard' and goes to /dashboards/[dashboardId].
3. Sees each dashboard as its own record with the dashboard's name and its last edited time, ordered most recently edited first (F05).
4. Can open a dashboard by its name, which goes to /dashboards/[dashboardId].
5. Can rename a dashboard in place, which saves the new name automatically, updates its last edited time and shows a confirmation that the change saved (FD03).
6. Can choose Duplicate for a dashboard, which creates a separate copy with all of its widgets, titles, type settings, content, order and sizes under the original name plus ' copy' and goes to /dashboards/[dashboardId] for the copy.
7. Can choose Delete for a dashboard, which opens D01.
8. Can open the account menu, which shows their name and lets them sign out to /.

When the user is signed out:
   1. Sees the logo, which leads to /.
   2. Can choose "Sign in", which goes to /sign-in.

When the member has no dashboards yet:
   1. Reads "No dashboards yet. Create your first dashboard to start your list."
   2. Can choose "Create", the main action, which creates a dashboard named 'Untitled dashboard' and goes to /dashboards/[dashboardId].

Route group: `web/app/(routes)/(app)/`. Screens inside it: S04 /dashboards, S05 /dashboards/[dashboardId].
Loads its records through: listDashboards.
