# Entities

## Dashboard

`@app/entities/dashboard`

- `dashboardName`: text

- `listDashboards()` or `useListDashboards()`: List the member's dashboards most-recently-edited first.
- `createDashboard(input)`: Create a new empty dashboard named Untitled dashboard.
- `getDashboard(id)` or `useGetDashboard(id)`: Load one dashboard by id with its name.
- `renameDashboard(id, changes)`: Rename a dashboard and update its last edited time.
- `touchDashboard(id, changes)`: Touch a dashboard to update its last edited time after a widget, item or link change.
- `deleteDashboard(id)`: Permanently delete a dashboard and all of its widgets.
- `duplicateDashboard(input)`: Duplicate a dashboard as a separate copy with all widgets under name plus copy.

## Widget

`@app/entities/widget`

- `widgetType`: enum WidgetType
- `widgetTitle`: text
- `widgetSize`: enum WidgetSize
- `noteText`: text, optional
- `counterLabel`: text, optional
- `counterNumber`: int
- `dashboard`: ref Dashboard id
- `position`: int

- `listWidgets()` or `useListWidgets()`: List the widgets of a dashboard in order.
- `getWidget(id)` or `useGetWidget(id)`: Load one widget by id with its title and type content.
- `createWidget(input)`: Add a widget of the chosen type with default title and settings.
- `duplicateWidgets(input)`: Copy all widgets with titles, settings, content, order and sizes for a duplicated dashboard.
- `updateWidgetTitle(id, changes)`: Update a widget's title.
- `updateNoteText(id, changes)`: Update the note text of a note widget.
- `updateCounterDetails(id, changes)`: Update the label and number of a counter widget.
- `moveWidget(id, changes)`: Move a widget earlier or later relative to the other widgets.
- `resizeWidget(id, changes)`: Change a widget's size among small, medium and large.
- `adjustCounter(id, changes)`: Increase or decrease a counter widget by one.
- `deleteWidget(id)`: Permanently remove a widget and its content.

## ChecklistItem

`@app/entities/checklistItem`

- `itemText`: text
- `tickedOff`: boolean
- `widget`: ref Widget id
- `position`: int

- `listChecklistItems()` or `useListChecklistItems()`: List the items of checklist widgets with text and ticked state.
- `createChecklistItem(input)`: Add a new unticked item to the end of a checklist.
- `tickChecklistItem(id, changes)`: Tick or untick a checklist item.
- `updateChecklistItem(id, changes)`: Edit the text of a checklist item.
- `deleteChecklistItem(id)`: Permanently remove a checklist item.

## Link

`@app/entities/link`

- `linkTitle`: text
- `webAddress`: url
- `widget`: ref Widget id
- `position`: int

- `listLinks()` or `useListLinks()`: List the links of a link list widget.
- `getLink(id)` or `useGetLink(id)`: Load one link by id with its title and web address.
- `createLink(input)`: Add a link with title and web address to a link list.
- `updateLink(id, changes)`: Update a link's title and web address.
- `deleteLink(id)`: Permanently remove a link from a link list.

## Enums

`@app/entities/enums`

- `WidgetType`: `note` (note), `counter` (counter), `checklist` (checklist), `link_list` (link list); options in `WidgetTypeOptions`
- `WidgetSize`: `small` (small), `medium` (medium), `large` (large); options in `WidgetSizeOptions`

## Sign-in

`@app/entities/auth`: `signUp(email)`, `signIn(email)`, `signOut()`, `useCurrentUser()`.
