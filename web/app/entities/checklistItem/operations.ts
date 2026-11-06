import { mockCall, type Read, useRead } from '../mock';

import { useChecklistItemStore } from './store';

import type { ChecklistItem, ChecklistItemInput } from './types';

export async function listChecklistItems(): Promise<ChecklistItem[]> {
  await mockCall('listChecklistItems');
  return useChecklistItemStore.getState().records;
}

export function useListChecklistItems(): Read<ChecklistItem[]> {
  return useRead('listChecklistItems', useChecklistItemStore('records'));
}

export async function createChecklistItem(input: ChecklistItemInput): Promise<ChecklistItem> {
  await mockCall('createChecklistItem');
  const now = new Date().toISOString();
  const record: ChecklistItem = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useChecklistItemStore.setState(({ records }) => ({ records: [...records, record] }));
  return record;
}

export async function tickChecklistItem(id: string, changes: Partial<ChecklistItemInput>): Promise<ChecklistItem> {
  await mockCall('tickChecklistItem');
  const current = useChecklistItemStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('ChecklistItem not found');
  const record: ChecklistItem = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useChecklistItemStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function updateChecklistItem(id: string, changes: Partial<ChecklistItemInput>): Promise<ChecklistItem> {
  await mockCall('updateChecklistItem');
  const current = useChecklistItemStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('ChecklistItem not found');
  const record: ChecklistItem = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useChecklistItemStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function deleteChecklistItem(id: string): Promise<void> {
  await mockCall('deleteChecklistItem');
  useChecklistItemStore.setState(({ records }) => ({ records: records.filter((record) => record.id !== id) }));
}
