import { mockCall, type Read, useRead } from '../mock';

import { useLinkStore } from './store';

import type { Link, LinkInput } from './types';

export async function listLinks(): Promise<Link[]> {
  await mockCall('listLinks');
  return useLinkStore.getState().records;
}

export function useListLinks(): Read<Link[]> {
  return useRead('listLinks', useLinkStore('records'));
}

export async function getLink(id: string): Promise<Link | undefined> {
  await mockCall('getLink');
  return useLinkStore.getState().records.find((record) => record.id === id);
}

export function useGetLink(id: string): Read<Link | undefined> {
  return useRead('getLink', useLinkStore(({ records }) => records.find((record) => record.id === id)));
}

export async function createLink(input: LinkInput): Promise<Link> {
  await mockCall('createLink');
  const now = new Date().toISOString();
  const record: Link = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  useLinkStore.setState(({ records }) => ({ records: [...records, record] }));
  return record;
}

export async function updateLink(id: string, changes: Partial<LinkInput>): Promise<Link> {
  await mockCall('updateLink');
  const current = useLinkStore.getState().records.find((record) => record.id === id);
  if (!current) throw new Error('Link not found');
  const record: Link = { ...current, ...changes, updatedAt: new Date().toISOString() };
  useLinkStore.setState(({ records }) => ({ records: records.map((r) => (r.id === id ? record : r)) }));
  return record;
}

export async function deleteLink(id: string): Promise<void> {
  await mockCall('deleteLink');
  useLinkStore.setState(({ records }) => ({ records: records.filter((record) => record.id !== id) }));
}
