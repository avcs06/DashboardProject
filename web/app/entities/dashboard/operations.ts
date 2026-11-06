import { createChecklistItem, deleteChecklistItem, listChecklistItems } from '../checklistItem';
import { createLink, deleteLink, listLinks } from '../link';
import { mockCall, type Read, useRead } from '../mock';
import { deleteWidget, duplicateWidgets, listWidgets } from '../widget';

import { useDashboardStore } from './store';

import type { Dashboard, DashboardInput } from './types';

export async function listDashboards(): Promise<Dashboard[]> {
  await mockCall('listDashboards');
  return useDashboardStore.getState().records;
}

export function useListDashboards(): Read<Dashboard[]> {
  return useRead('listDashboards', useDashboardStore('records'));
}

/** The dashboard the member edited last, across views. */
export function useLastEditedDashboardId(): Read<string | null> {
  return useRead('lastEditedDashboard', useDashboardStore('lastEditedId') ?? null);
}

export async function createDashboard(input: DashboardInput): Promise<Dashboard> {
  await mockCall('createDashboard');
  const now = new Date().toISOString();
  const record: Dashboard = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useDashboardStore.setState(({ records }) => ({ records: [...records, record], lastEditedId: record.id }));
  return record;
}

export async function getDashboard(id: string): Promise<Dashboard | undefined> {
  await mockCall('getDashboard');
  return useDashboardStore.getState().records.find((record) => record.id === id);
}

export function useGetDashboard(id: string): Read<Dashboard | undefined> {
  return useRead('getDashboard', useDashboardStore(({ records }) => records.find((record) => record.id === id)));
}

export async function renameDashboard(id: string, changes: Partial<DashboardInput>): Promise<Dashboard> {
  await mockCall('renameDashboard');
  const current = useDashboardStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Dashboard not found');
  const record: Dashboard = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useDashboardStore.setState(({ records }) => ({
    records: records.map((r) => (r.id === id ? record : r)),
    lastEditedId: id,
  }));
  return record;
}

export async function touchDashboard(id: string, changes: Partial<DashboardInput>): Promise<Dashboard> {
  await mockCall('touchDashboard');
  const current = useDashboardStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Dashboard not found');
  const record: Dashboard = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useDashboardStore.setState(({ records }) => ({
    records: records.map((r) => (r.id === id ? record : r)),
    lastEditedId: id,
  }));
  return record;
}

export async function deleteDashboard(id: string): Promise<void> {
  await mockCall('deleteDashboard');
  useDashboardStore.setState(({ records }) => ({ records: records.filter((record) => record.id !== id) }));
}

export async function duplicateDashboard(input: DashboardInput): Promise<Dashboard> {
  await mockCall('duplicateDashboard');
  const now = new Date().toISOString();
  const record: Dashboard = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useDashboardStore.setState(({ records }) => ({ records: [...records, record], lastEditedId: record.id }));
  return record;
}

/** The dashboard was deleted in the meantime, so there is nothing to change. */
export class DashboardGoneError extends Error {
  constructor() {
    super('Dashboard is gone');
    this.name = 'DashboardGoneError';
  }
}

/**
 * Duplicate a dashboard as a separate copy with all of its widgets, titles,
 * type settings, content, order and sizes, under the original name plus
 * ' copy'. Returns the copy's id. Throws DashboardGoneError when the
 * original was deleted in the meantime.
 */
export async function duplicateDashboardCascade(sourceId: string): Promise<string> {
  const source = await getDashboard(sourceId);
  if (!source) throw new DashboardGoneError();
  const copy = await duplicateDashboard({ dashboardName: `${source.dashboardName} copy` });
  try {
    const widgets = (await listWidgets())
      .filter((widget) => widget.dashboard === sourceId)
      .sort((a, b) => a.position - b.position);
    const [items, links] = await Promise.all([listChecklistItems(), listLinks()]);
    for (const widget of widgets) {
      const widgetCopy = await duplicateWidgets({
        widgetType: widget.widgetType,
        widgetTitle: widget.widgetTitle,
        widgetSize: widget.widgetSize,
        noteText: widget.noteText,
        counterLabel: widget.counterLabel,
        counterNumber: widget.counterNumber,
        dashboard: copy.id,
        position: widget.position,
      });
      const widgetItems = items
        .filter((item) => item.widget === widget.id)
        .sort((a, b) => a.position - b.position);
      for (const item of widgetItems) {
        await createChecklistItem({
          itemText: item.itemText,
          tickedOff: item.tickedOff,
          widget: widgetCopy.id,
          position: item.position,
        });
      }
      const widgetLinks = links
        .filter((link) => link.widget === widget.id)
        .sort((a, b) => a.position - b.position);
      for (const link of widgetLinks) {
        await createLink({
          linkTitle: link.linkTitle,
          webAddress: link.webAddress,
          widget: widgetCopy.id,
          position: link.position,
        });
      }
    }
  } catch (error) {
    // Leave no half-made copy behind: remove what the copy started before
    // reporting the failure.
    await deleteDashboardCascade(copy.id).catch(() => undefined);
    throw error;
  }
  return copy.id;
}

/**
 * Permanently delete a dashboard and all of its widgets with their items
 * and links. Throws DashboardGoneError when it was already deleted.
 */
export async function deleteDashboardCascade(id: string): Promise<void> {
  const dashboard = await getDashboard(id);
  if (!dashboard) throw new DashboardGoneError();
  const [widgets, items, links] = await Promise.all([
    listWidgets(),
    listChecklistItems(),
    listLinks(),
  ]);
  const ownWidgets = widgets.filter((widget) => widget.dashboard === id);
  for (const widget of ownWidgets) {
    for (const item of items.filter((entry) => entry.widget === widget.id)) {
      await deleteChecklistItem(item.id);
    }
    for (const link of links.filter((entry) => entry.widget === widget.id)) {
      await deleteLink(link.id);
    }
    await deleteWidget(widget.id);
  }
  await deleteDashboard(id);
}
