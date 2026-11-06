'use client';

import { NextLink } from '@app/components/NextLink';
import {
  DashboardGoneError,
  deleteDashboardCascade,
  duplicateDashboardCascade,
  renameDashboard,
} from '@app/entities/dashboard';
import { Button, IconButton } from '@packages/ui/Button';
import { openConfirmationDialog, DialogResult } from '@packages/ui/Dialog';
import { Dropdown } from '@packages/ui/Dropdown';
import { Input } from '@packages/ui/Input';
import { SidebarMenuItem } from '@packages/ui/SidebarMenu';
import { toast } from '@packages/ui/Toast';
import { Truncate } from '@packages/ui/Truncate';
import { Paragraph, Time } from '@packages/ui/Typography';
import { Check, Copy, Ellipsis, Pencil, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import type { Dashboard } from '@app/entities/dashboard';

/**
 * One dashboard in the app sidebar: a link with its name and last edited
 * time, a menu with Rename, Duplicate and Delete, and the name as an
 * editable field while renaming.
 */
export const DashboardRow = ({
  dashboard,
  selected,
  onRowRemoved,
}: {
  dashboard: Dashboard;
  selected: boolean;
  /** The row is gone: focus the list and leave its page when on it. */
  onRowRemoved: (id: string) => void;
}) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dashboard.dashboardName);
  const [error, setError] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLElement>(null);

  const href = `/dashboards/${dashboard.id}`;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startRenaming = () => {
    setDraft(dashboard.dashboardName);
    setError(undefined);
    setEditing(true);
  };

  const cancelRenaming = () => {
    setEditing(false);
    setError(undefined);
    menuTriggerRef.current?.focus();
  };

  const saveName = async () => {
    if (saving) return;
    if (draft.trim() === '') {
      setError('Enter a dashboard name');
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await renameDashboard(dashboard.id, { dashboardName: draft.trim() });
      setEditing(false);
      setError(undefined);
      toast({ title: 'Dashboard renamed', status: 'success' });
      menuTriggerRef.current?.focus();
    } catch {
      setError(undefined);
      toast({
        title: 'Could not save the name',
        description: 'Try again.',
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (working) return;
    setWorking(true);
    try {
      const copyId = await duplicateDashboardCascade(dashboard.id);
      toast({ title: 'Dashboard duplicated', status: 'success' });
      router.push(`/dashboards/${copyId}`);
    } catch (e) {
      if (e instanceof DashboardGoneError) {
        toast({ title: 'That dashboard is already gone.', status: 'warning' });
        onRowRemoved(dashboard.id);
      } else {
        toast({
          title: 'Could not duplicate the dashboard',
          description: 'Try again.',
          status: 'error',
        });
      }
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    if (working) return;
    const result = await openConfirmationDialog({
      title: 'Delete this dashboard?',
      content: (
        <>
          <Paragraph>{dashboard.dashboardName}</Paragraph>
          <Paragraph color="muted">
            Deleting it permanently deletes the dashboard and all of its
            widgets, with no way to undo it.
          </Paragraph>
        </>
      ),
      status: 'error',
      footer: (closeDialog) => (
        <>
          <Button
            // Secondary: the destructive confirm carries the emphasis here.
            variant="base"
            onClick={() => closeDialog(DialogResult.cancel)}
          >
            Cancel
          </Button>
          <Button
            // Filled danger: confirming permanently deletes the dashboard.
            variant="danger"
            onClick={() => closeDialog(DialogResult.confirm)}
          >
            Delete
          </Button>
        </>
      ),
    });
    if (result !== DialogResult.confirm) return;
    setWorking(true);
    try {
      await deleteDashboardCascade(dashboard.id);
      toast({ title: 'Dashboard deleted', status: 'success' });
      onRowRemoved(dashboard.id);
    } catch (e) {
      if (e instanceof DashboardGoneError) {
        toast({ title: 'That dashboard is already gone.', status: 'warning' });
        onRowRemoved(dashboard.id);
      } else {
        toast({
          title: 'Could not delete the dashboard',
          description: 'Try again.',
          status: 'error',
        });
      }
    } finally {
      setWorking(false);
    }
  };

  if (editing) {
    return (
      <SidebarMenuItem as="div">
        <Input
          ref={inputRef}
          aria-label="Dashboard name"
          autoComplete="off"
          maxLength={120}
          variant="base"
          size="sm"
          value={draft}
          onChange={setDraft}
          error={error}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void saveName();
            }
            if (event.key === 'Escape') cancelRenaming();
          }}
          className="min-w-0 flex-1"
        />
        <IconButton
          variant="base"
          look="ghost"
          size="xs"
          tooltip="Save"
          aria-label={`Save dashboard name`}
          loadingWithReason={saving ? 'Saving the name' : undefined}
          onClick={() => void saveName()}
        >
          <Check />
        </IconButton>
        <IconButton
          variant="base"
          look="ghost"
          size="xs"
          tooltip="Cancel"
          aria-label="Cancel renaming"
          onClick={cancelRenaming}
        >
          <X />
        </IconButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem as="div">
      <NextLink
        look="plain"
        href={href}
        aria-current={selected ? 'page' : undefined}
        className="min-w-0 flex-1"
      >
        <Truncate>{dashboard.dashboardName}</Truncate>
      </NextLink>
      <Time value={dashboard.updatedAt} withTime className="shrink-0" />
      <Dropdown
        menu={
          <>
            <Dropdown.Item leftIcon={<Pencil />} onSelect={startRenaming}>
              Rename
            </Dropdown.Item>
            <Dropdown.Item leftIcon={<Copy />} onSelect={() => void duplicate()}>
              Duplicate
            </Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item leftIcon={<Trash2 />} onSelect={() => void remove()}>
              Delete
            </Dropdown.Item>
          </>
        }
      >
        <IconButton
          ref={menuTriggerRef}
          variant="base"
          look="ghost"
          size="xs"
          tooltip="Actions"
          aria-label={`Actions for ${dashboard.dashboardName}`}
        >
          <Ellipsis />
        </IconButton>
      </Dropdown>
    </SidebarMenuItem>
  );
};
