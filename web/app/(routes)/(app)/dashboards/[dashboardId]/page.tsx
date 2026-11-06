'use client';

import { WidgetCardBody } from '@app/blocks/WidgetCard';
import { NotFound } from '@app/components/NotFound';
import { PageHeader } from '@app/components/PageHeader';
import { deleteChecklistItem, tickChecklistItem, useListChecklistItems } from '@app/entities/checklistItem';
import {
  DashboardGoneError,
  deleteDashboardCascade,
  duplicateDashboardCascade,
  renameDashboard,
  touchDashboard,
  useGetDashboard,
} from '@app/entities/dashboard';
import { deleteLink, useListLinks } from '@app/entities/link';
import {
  adjustCounter,
  deleteWidget,
  moveWidget,
  resizeWidget,
  useListWidgets,
  type Widget as WidgetRecord,
} from '@app/entities/widget';
import { Button, IconButton } from '@packages/ui/Button';
import { CardList } from '@packages/ui/Card';
import { Chip, ChipGroup } from '@packages/ui/Chip';
import { Input } from '@packages/ui/Input';
import { toast } from '@packages/ui/Toast';
import { Paragraph, Time } from '@packages/ui/Typography';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { AddWidgetDialog } from './components/AddWidgetDialog';
import { ChecklistItemDialog } from './components/ChecklistItemDialog';
import { ConfigureWidgetDialog } from './components/ConfigureWidgetDialog';
import { LinkDialog } from './components/LinkDialog';
import { RemoveConfirmDialog } from './components/RemoveConfirmDialog';

import type { ChecklistItem } from '@app/entities/checklistItem';
import type { Dashboard } from '@app/entities/dashboard';
import type { Link as LinkRecord } from '@app/entities/link';
import type { Widget } from '@app/entities/widget';

type ItemDialogState = {
  widgetId: string;
  itemId?: string;
  initialText?: string;
  position?: number;
};

type LinkDialogState = {
  widgetId: string;
  linkId?: string;
  position?: number;
};

/**
 * S05 The dashboard's name (/dashboards/[dashboardId]): read, use and build
 * one dashboard. Viewing shows the widgets in order with working counters,
 * checklists and links; editing adds the editing controls and a Done action.
 * Every change saves automatically, updates the last edited time and shows a
 * confirmation. Layout: one column, the dashboard first, then its widgets in
 * order; editing controls sit with the widget they change.
 */
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.dashboardId as string;

  const { data: dashboard, loading: dashboardLoading, error: dashboardError, retry: retryDashboard } = useGetDashboard(dashboardId);
  const { data: widgets, loading: widgetsLoading, error: widgetsError, retry: retryWidgets } = useListWidgets();
  const { data: items, loading: itemsLoading, error: itemsError, retry: retryItems } = useListChecklistItems();
  const { data: links, loading: linksLoading, error: linksError, retry: retryLinks } = useListLinks();

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | undefined>(undefined);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [configureId, setConfigureId] = useState<string | null>(null);
  const [itemDialog, setItemDialog] = useState<ItemDialogState | null>(null);
  const [linkDialog, setLinkDialog] = useState<LinkDialogState | null>(null);
  const [removeWidgetTarget, setRemoveWidgetTarget] = useState<Widget | null>(null);
  const [removeItemTarget, setRemoveItemTarget] = useState<ChecklistItem | null>(null);
  const [removeLinkTarget, setRemoveLinkTarget] = useState<LinkRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const ownWidgets = widgets
    .filter((widget) => widget.dashboard === dashboardId)
    .sort((a, b) => a.position - b.position);
  const itemsOf = (widgetId: string) =>
    items.filter((item) => item.widget === widgetId).sort((a, b) => a.position - b.position);
  const linksOf = (widgetId: string) =>
    links.filter((link) => link.widget === widgetId).sort((a, b) => a.position - b.position);

  const saved = () => toast({ title: 'Change saved', status: 'success' });

  const guard = async (key: string, work: () => Promise<void>, goneMessage: string) => {
    if (busy !== undefined) return;
    setBusy(key);
    try {
      await work();
      await touchDashboard(dashboardId, {});
      saved();
    } catch (error) {
      if (
        (error instanceof Error && error.message.endsWith('not found')) ||
        error instanceof DashboardGoneError
      ) {
        toast({ title: goneMessage, status: 'warning' });
      } else {
        toast({ title: 'The change could not be saved. Try again.', status: 'error' });
      }
    } finally {
      setBusy(undefined);
    }
  };

  const adjust = (widget: Widget, delta: 1 | -1) =>
    void guard(`counter-${widget.id}`, async () => {
      await adjustCounter(widget.id, { counterNumber: widget.counterNumber + delta });
    }, 'That widget is already gone.');

  const toggle = (item: ChecklistItem, tickedOff: boolean) =>
    void guard(`item-${item.id}`, async () => {
      await tickChecklistItem(item.id, { tickedOff });
    }, 'That item is already gone.');

  const move = (widget: Widget, direction: -1 | 1) =>
    void guard(`move-${widget.id}`, async () => {
      const index = ownWidgets.findIndex((entry) => entry.id === widget.id);
      const neighbor = ownWidgets[index + direction];
      if (!neighbor) return;
      await moveWidget(widget.id, { position: neighbor.position });
      await moveWidget(neighbor.id, { position: widget.position });
    }, 'That widget is already gone.');

  const resize = (widget: WidgetRecord, size: string) =>
    void guard(`size-${widget.id}`, async () => {
      await resizeWidget(widget.id, { widgetSize: size as Widget['widgetSize'] });
    }, 'That widget is already gone.');

  const afterRemoved = () => {
    void (async () => {
      try {
        await touchDashboard(dashboardId, {});
        saved();
      } catch {
        toast({ title: 'The change could not be saved. Try again.', status: 'error' });
      }
    })();
  };

  const duplicate = async (source: Dashboard) => {
    if (busy !== undefined) return;
    setBusy('duplicate');
    try {
      const copyId = await duplicateDashboardCascade(source.id);
      toast({ title: 'Dashboard duplicated', status: 'success' });
      router.push(`/dashboards/${copyId}`);
    } catch (error) {
      if (error instanceof DashboardGoneError) {
        toast({ title: 'That dashboard is already gone.', status: 'warning' });
        router.push('/dashboards');
      } else {
        toast({ title: 'The dashboard could not be duplicated. Try again.', status: 'error' });
      }
    } finally {
      setBusy(undefined);
    }
  };

  if (dashboardLoading || widgetsLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          breadcrumb={[{ label: 'Your dashboards', href: '/dashboards' }]}
        />
        <Paragraph color="muted">Loading the dashboard…</Paragraph>
      </>
    );
  }

  if (dashboardError !== null || widgetsError !== null || dashboard === undefined) {
    if (dashboard === undefined && dashboardError === null && widgetsError === null) {
      return (
        <NotFound
          title="Dashboard not found"
          description="This dashboard is gone. It may have been deleted."
          back={{ label: 'Back to your dashboards', href: '/dashboards' }}
        />
      );
    }
    return (
      <>
        <PageHeader
          title="Dashboard"
          breadcrumb={[{ label: 'Your dashboards', href: '/dashboards' }]}
        />
        <div className="flex-col-gap-2 items-start">
          <Paragraph color="muted">The dashboard could not be loaded.</Paragraph>
          <Button
            onClick={() => {
              retryDashboard();
              retryWidgets();
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );
  }

  const header = (
    <PageHeader
      title={
        editing ? (
          <DashboardNameField
            dashboard={dashboard}
            busy={busy === 'rename'}
            onBusy={(on) => setBusy(on ? 'rename' : undefined)}
          />
        ) : (
          dashboard.dashboardName
        )
      }
      description={
        <>
          Last edited <Time value={dashboard.updatedAt} withTime />
        </>
      }
      breadcrumb={[{ label: 'Your dashboards', href: '/dashboards' }]}
      actions={
        editing ? (
          <>
            <Button
              // Secondary: finishing the edit carries the emphasis here.
              variant="base"
              loadingWithReason={busy === 'duplicate' ? 'Duplicating the dashboard' : undefined}
              onClick={() => void duplicate(dashboard)}
            >
              Duplicate
            </Button>
            <Button
              // Quiet: the confirm dialog's Delete carries the danger.
              variant="base"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <Button onClick={() => setEditing(false)}>Done</Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )
      }
    />
  );

  if (itemsLoading || linksLoading) {
    return (
      <>
        {header}
        <Paragraph color="muted">Loading the widgets…</Paragraph>
      </>
    );
  }

  if (itemsError !== null || linksError !== null) {
    return (
      <>
        {header}
        <div className="flex-col-gap-2 items-start">
          <Paragraph color="muted">The widgets could not be loaded.</Paragraph>
          <Button
            onClick={() => {
              retryItems();
              retryLinks();
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );
  }

  const nextWidgetPosition =
    ownWidgets.length > 0 ? Math.max(...ownWidgets.map((widget) => widget.position)) + 1 : 0;

  const widgetBody = (widget: Widget) => {
    const index = ownWidgets.findIndex((entry) => entry.id === widget.id);
    return (
      <WidgetCardBody
        widget={widget}
        items={itemsOf(widget.id)}
        links={linksOf(widget.id)}
        onIncrement={(entry) => adjust(entry, 1)}
        onDecrement={(entry) => adjust(entry, -1)}
        onToggleItem={(item, tickedOff) => toggle(item, tickedOff)}
        busy={busy}
        headerAction={
          editing ? (
            <div className="flex-row-gap-1 items-center">
              <IconButton
                // Quiet row action: configuring opens beside the widget.
                variant="base"
                look="ghost"
                size="xs"
                tooltip="Configure"
                aria-label={`Configure ${widget.widgetTitle}`}
                onClick={() => setConfigureId(widget.id)}
              >
                <Pencil />
              </IconButton>
              <IconButton
                // Quiet row action: moving keeps the widget where it is read.
                variant="base"
                look="ghost"
                size="xs"
                tooltip="Move earlier"
                aria-label={`Move ${widget.widgetTitle} earlier`}
                disabledWithReason={index === 0 ? 'Already first' : undefined}
                loadingWithReason={busy === `move-${widget.id}` ? 'Moving the widget' : undefined}
                onClick={() => move(widget, -1)}
              >
                <ArrowUp />
              </IconButton>
              <IconButton
                // Quiet row action: moving keeps the widget where it is read.
                variant="base"
                look="ghost"
                size="xs"
                tooltip="Move later"
                aria-label={`Move ${widget.widgetTitle} later`}
                disabledWithReason={index === ownWidgets.length - 1 ? 'Already last' : undefined}
                loadingWithReason={busy === `move-${widget.id}` ? 'Moving the widget' : undefined}
                onClick={() => move(widget, 1)}
              >
                <ArrowDown />
              </IconButton>
              <IconButton
                // Quiet row action: removing asks first in a confirm dialog.
                variant="base"
                look="ghost"
                size="xs"
                tooltip="Remove"
                aria-label={`Remove ${widget.widgetTitle}`}
                onClick={() => setRemoveWidgetTarget(widget)}
              >
                <Trash2 />
              </IconButton>
            </div>
          ) : undefined
        }
        itemAction={
          editing
            ? (item) => (
                <div className="flex-row-gap-1 items-center">
                  <IconButton
                    // Quiet row action: editing opens beside the item.
                    variant="base"
                    look="ghost"
                    size="xs"
                    tooltip="Edit"
                    aria-label={`Edit ${item.itemText}`}
                    onClick={() =>
                      setItemDialog({ widgetId: widget.id, itemId: item.id, initialText: item.itemText })
                    }
                  >
                    <Pencil />
                  </IconButton>
                  <IconButton
                    // Quiet row action: removing asks first in a confirm dialog.
                    variant="base"
                    look="ghost"
                    size="xs"
                    tooltip="Remove"
                    aria-label={`Remove ${item.itemText}`}
                    onClick={() => setRemoveItemTarget(item)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              )
            : undefined
        }
        linkAction={
          editing
            ? (link) => (
                <div className="flex-row-gap-1 items-center">
                  <IconButton
                    // Quiet row action: editing opens beside the link.
                    variant="base"
                    look="ghost"
                    size="xs"
                    tooltip="Edit"
                    aria-label={`Edit ${link.linkTitle}`}
                    onClick={() => setLinkDialog({ widgetId: widget.id, linkId: link.id })}
                  >
                    <Pencil />
                  </IconButton>
                  <IconButton
                    // Quiet row action: removing asks first in a confirm dialog.
                    variant="base"
                    look="ghost"
                    size="xs"
                    tooltip="Remove"
                    aria-label={`Remove ${link.linkTitle}`}
                    onClick={() => setRemoveLinkTarget(link)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              )
            : undefined
        }
        footer={
          editing ? (
            <div className="flex-col-gap-2 items-start">
              <ChipGroup
                mode="single"
                aria-label={`Widget size for ${widget.widgetTitle}`}
                value={widget.widgetSize}
                onChange={(size) => resize(widget, size)}
              >
                <Chip value="small">Small</Chip>
                <Chip value="medium">Medium</Chip>
                <Chip value="large">Large</Chip>
              </ChipGroup>
              {widget.widgetType === 'checklist' ? (
                <Button
                  // Secondary: the widget's own controls carry its edits.
                  variant="base"
                  leftIcon={<Plus />}
                  onClick={() =>
                    setItemDialog({ widgetId: widget.id, position: itemsOf(widget.id).length })
                  }
                >
                  Add an item
                </Button>
              ) : null}
              {widget.widgetType === 'link_list' ? (
                <Button
                  // Secondary: the widget's own controls carry its edits.
                  variant="base"
                  leftIcon={<Plus />}
                  onClick={() =>
                    setLinkDialog({ widgetId: widget.id, position: linksOf(widget.id).length })
                  }
                >
                  Add a link
                </Button>
              ) : null}
              {widget.widgetType === 'note' && !widget.noteText ? (
                <Button
                  // Secondary: the widget's own controls carry its edits.
                  variant="base"
                  leftIcon={<Pencil />}
                  onClick={() => setConfigureId(widget.id)}
                >
                  Configure
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />
    );
  };

  return (
    <>
      {header}
      <div className="flex-col-gap-4 items-start">
        {ownWidgets.length === 0 ? (
          <div className="flex-col-gap-2 items-start">
            <Paragraph>No widgets yet. Add your first widget to start building this dashboard.</Paragraph>
            <Button leftIcon={<Plus />} onClick={() => setAddWidgetOpen(true)}>
              Add a widget
            </Button>
          </div>
        ) : (
          <>
            {editing ? (
              <Button
                // Secondary: finishing the edit stays the page's main action.
                variant="base"
                leftIcon={<Plus />}
                onClick={() => setAddWidgetOpen(true)}
              >
                Add a widget
              </Button>
            ) : null}
            <CardList
              aria-label="Widgets"
              items={ownWidgets}
              renderItem={(widget) => widgetBody(widget)}
            />
          </>
        )}
      </div>
      <AddWidgetDialog
        dashboardId={dashboardId}
        position={nextWidgetPosition}
        open={addWidgetOpen}
        onOpenChange={setAddWidgetOpen}
      />
      {configureId !== null ? (
        <ConfigureWidgetDialog
          dashboardId={dashboardId}
          widgetId={configureId}
          open
          onOpenChange={(open) => {
            if (!open) setConfigureId(null);
          }}
        />
      ) : null}
      {itemDialog !== null ? (
        <ChecklistItemDialog
          dashboardId={dashboardId}
          widgetId={itemDialog.widgetId}
          itemId={itemDialog.itemId}
          initialText={itemDialog.initialText}
          position={itemDialog.position}
          open
          onOpenChange={(open) => {
            if (!open) setItemDialog(null);
          }}
        />
      ) : null}
      {linkDialog !== null ? (
        <LinkDialog
          dashboardId={dashboardId}
          widgetId={linkDialog.widgetId}
          linkId={linkDialog.linkId}
          position={linkDialog.position}
          open
          onOpenChange={(open) => {
            if (!open) setLinkDialog(null);
          }}
        />
      ) : null}
      {removeWidgetTarget !== null ? (
        <RemoveConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setRemoveWidgetTarget(null);
          }}
          title="Remove this widget?"
          recordName={removeWidgetTarget.widgetTitle}
          consequence="Removing it will permanently remove the widget and its content, with no way to undo it."
          failureMessage="The widget could not be removed. Try again."
          goneMessage="That widget is already gone."
          savingMessage="Removing the widget"
          isGoneError={(error) => error instanceof Error && error.message === 'Widget not found'}
          onConfirm={() => deleteWidget(removeWidgetTarget.id)}
          onConfirmed={() => {
            setRemoveWidgetTarget(null);
            afterRemoved();
          }}
          onGoneClosed={() => setRemoveWidgetTarget(null)}
        />
      ) : null}
      {removeItemTarget !== null ? (
        <RemoveConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setRemoveItemTarget(null);
          }}
          title="Remove this item?"
          recordName={removeItemTarget.itemText}
          consequence="Removing it is permanent, with no way to undo it."
          failureMessage="The item could not be removed. Try again."
          goneMessage="That item is already gone."
          savingMessage="Removing the item"
          isGoneError={(error) => error instanceof Error && error.message === 'ChecklistItem not found'}
          onConfirm={() => deleteChecklistItem(removeItemTarget.id)}
          onConfirmed={() => {
            setRemoveItemTarget(null);
            afterRemoved();
          }}
          onGoneClosed={() => setRemoveItemTarget(null)}
        />
      ) : null}
      {removeLinkTarget !== null ? (
        <RemoveConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setRemoveLinkTarget(null);
          }}
          title="Remove this link?"
          recordName={removeLinkTarget.linkTitle}
          consequence="Removing it is permanent, with no way to undo it."
          failureMessage="The link could not be removed. Try again."
          goneMessage="That link is already gone."
          savingMessage="Removing the link"
          isGoneError={(error) => error instanceof Error && error.message === 'Link not found'}
          onConfirm={() => deleteLink(removeLinkTarget.id)}
          onConfirmed={() => {
            setRemoveLinkTarget(null);
            afterRemoved();
          }}
          onGoneClosed={() => setRemoveLinkTarget(null)}
        />
      ) : null}
      {deleteOpen ? (
        <RemoveConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteOpen(false);
          }}
          title="Delete this dashboard?"
          recordName={dashboard.dashboardName}
          consequence="Deleting it will permanently delete the dashboard and all of its widgets, with no way to undo it."
          failureMessage="The dashboard could not be deleted. Try again."
          goneMessage="That dashboard is already gone."
          savingMessage="Deleting the dashboard"
          isGoneError={(error) => error instanceof DashboardGoneError}
          onConfirm={() => deleteDashboardCascade(dashboard.id)}
          onConfirmed={() => {
            setDeleteOpen(false);
            toast({ title: 'Dashboard deleted', status: 'success' });
            router.push('/dashboards');
          }}
          onGoneClosed={() => {
            setDeleteOpen(false);
            router.push('/dashboards');
          }}
        />
      ) : null}
    </>
  );
}

/** The dashboard's name as an in-place rename while editing, with save and cancel beside it. */
const DashboardNameField = ({
  dashboard,
  busy,
  onBusy,
}: {
  dashboard: Dashboard;
  busy: boolean;
  onBusy: (on: boolean) => void;
}) => {
  const [draft, setDraft] = useState(dashboard.dashboardName);
  const [error, setError] = useState<string | undefined>(undefined);

  const save = async () => {
    if (busy) return;
    if (draft.trim() === '') {
      setError('Enter a dashboard name');
      return;
    }
    onBusy(true);
    try {
      await renameDashboard(dashboard.id, { dashboardName: draft.trim() });
      setError(undefined);
      toast({ title: 'Change saved', status: 'success' });
    } catch {
      toast({ title: 'The name could not be saved. Try again.', status: 'error' });
    } finally {
      onBusy(false);
    }
  };

  return (
    <span className="flex-row-gap-2 items-center">
      <Input
        aria-label="Dashboard name"
        autoComplete="off"
        maxLength={120}
        value={draft}
        onChange={setDraft}
        error={error}
        className="min-w-0 flex-1"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void save();
          }
          if (event.key === 'Escape') {
            setDraft(dashboard.dashboardName);
            setError(undefined);
          }
        }}
      />
      <IconButton tooltip="Save" aria-label="Save dashboard name" onClick={() => void save()}>
        <Check />
      </IconButton>
      <IconButton
        tooltip="Cancel"
        aria-label="Cancel renaming"
        onClick={() => {
          setDraft(dashboard.dashboardName);
          setError(undefined);
        }}
      >
        <X />
      </IconButton>
    </span>
  );
};
