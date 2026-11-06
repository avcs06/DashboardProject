import { mockCall, type Read, useRead } from '../mock';

import { useWidgetStore } from './store';

import type { Widget, WidgetInput } from './types';

export async function listWidgets(): Promise<Widget[]> {
  await mockCall('listWidgets');
  return useWidgetStore.getState().records;
}

export function useListWidgets(): Read<Widget[]> {
  return useRead('listWidgets', useWidgetStore('records'));
}

export async function getWidget(id: string): Promise<Widget | undefined> {
  await mockCall('getWidget');
  return useWidgetStore.getState().records.find((record) => record.id === id);
}

export function useGetWidget(id: string): Read<Widget | undefined> {
  return useRead('getWidget', useWidgetStore(({ records }) => records.find((record) => record.id === id)));
}

export async function createWidget(input: WidgetInput): Promise<Widget> {
  await mockCall('createWidget');
  const now = new Date().toISOString();
  const record: Widget = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useWidgetStore.setState(({ records }) => ({ records: [...records, record] }));
  return record;
}

export async function duplicateWidgets(input: WidgetInput): Promise<Widget> {
  await mockCall('duplicateWidgets');
  const now = new Date().toISOString();
  const record: Widget = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useWidgetStore.setState(({ records }) => ({ records: [...records, record] }));
  return record;
}

export async function updateWidgetTitle(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('updateWidgetTitle');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function updateNoteText(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('updateNoteText');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function updateCounterDetails(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('updateCounterDetails');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function moveWidget(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('moveWidget');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function resizeWidget(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('resizeWidget');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function adjustCounter(id: string, changes: Partial<WidgetInput>): Promise<Widget> {
  await mockCall('adjustCounter');
  const current = useWidgetStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Widget not found');
  const record: Widget = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useWidgetStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function deleteWidget(id: string): Promise<void> {
  await mockCall('deleteWidget');
  useWidgetStore.setState(({ records }) => ({ records: records.filter((record) => record.id !== id) }));
}
