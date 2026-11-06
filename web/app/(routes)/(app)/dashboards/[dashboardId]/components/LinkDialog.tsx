'use client';

import { touchDashboard } from '@app/entities/dashboard';
import { createLink, updateLink, useGetLink } from '@app/entities/link';
import { Button } from '@packages/ui/Button';
import { Dialog } from '@packages/ui/Dialog';
import { Controller, Form } from '@packages/ui/Form';
import { Input } from '@packages/ui/Input';
import { toast } from '@packages/ui/Toast';
import { Paragraph } from '@packages/ui/Typography';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';


type LinkFields = { linkTitle: string; webAddress: string };

const webAddressRules = {
  required: 'Enter a web address',
  maxLength: { value: 2000, message: 'Keep the web address to 2000 characters' },
  validate: (value: string) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') ||
        'Enter a web address like https://example.com'
      );
    } catch {
      return 'Enter a web address like https://example.com';
    }
  },
};

/**
 * D07 Add a link and D08 Edit link: one link, made of a title and a web
 * address, goes onto a link list widget, or one link's title or web address
 * changes. Saving updates the dashboard's last edited time and closes the
 * dialog.
 */
export const LinkDialog = ({
  dashboardId,
  widgetId,
  linkId,
  position,
  open,
  onOpenChange,
}: {
  dashboardId: string;
  widgetId: string;
  /** Set to edit one link; left out to add a new one. */
  linkId?: string;
  /** The position a new link takes, after the others. */
  position?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const editing = linkId !== undefined;
  const { data: link, loading } = useGetLink(editing ? linkId : '');
  const [gone, setGone] = useState(false);
  const [saving, setSaving] = useState(false);
  const linkGone = (editing && !loading && link === undefined) || gone;

  return (
    <Dialog
      title={editing ? 'Edit link' : 'Add a link'}
      open={open}
      onOpenChange={onOpenChange}
      footer={
        linkGone ? (
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        ) : (
          <>
            <Button
              // Secondary: saving the link carries the emphasis here.
              variant="base"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="dashboard-link"
              // Saving disables the button, so a second press does nothing.
              loadingWithReason={saving ? 'Saving the link' : undefined}
            >
              Save
            </Button>
          </>
        )
      }
    >
      {linkGone ? (
        <Paragraph color="muted">That link is gone.</Paragraph>
      ) : editing && loading ? (
        <Paragraph color="muted">Loading the link…</Paragraph>
      ) : (
        <LinkForm
          key={link?.id ?? 'new'}
          dashboardId={dashboardId}
          widgetId={widgetId}
          linkId={linkId}
          defaults={{
            linkTitle: link?.linkTitle ?? '',
            webAddress: link?.webAddress ?? '',
          }}
          position={position}
          onSaved={() => onOpenChange(false)}
          onGone={() => setGone(true)}
          onSaving={setSaving}
        />
      )}
    </Dialog>
  );
};

const LinkForm = ({
  dashboardId,
  widgetId,
  linkId,
  defaults,
  position,
  onSaved,
  onGone,
  onSaving,
}: {
  dashboardId: string;
  widgetId: string;
  linkId?: string;
  defaults: LinkFields;
  position?: number;
  onSaved: () => void;
  onGone: () => void;
  onSaving: (saving: boolean) => void;
}) => {
  const { control, handleSubmit, setError, formState } = useForm<LinkFields>({
    defaultValues: defaults,
  });
  const savingRef = useRef(false);

  const save = async (values: LinkFields) => {
    if (savingRef.current) return;
    savingRef.current = true;
    onSaving(true);
    try {
      if (linkId !== undefined) {
        await updateLink(linkId, {
          linkTitle: values.linkTitle.trim(),
          webAddress: values.webAddress.trim(),
        });
      } else {
        await createLink({
          linkTitle: values.linkTitle.trim(),
          webAddress: values.webAddress.trim(),
          widget: widgetId,
          position: position ?? 0,
        });
      }
      await touchDashboard(dashboardId, {});
      toast({ title: 'Change saved', status: 'success' });
      onSaved();
    } catch (error) {
      if (error instanceof Error && error.message === 'Link not found') {
        onGone();
      } else {
        setError('root.server', {
          message:
            linkId !== undefined
              ? 'The changes could not be saved. Try again.'
              : 'The link could not be saved. Try again.',
        });
      }
    } finally {
      savingRef.current = false;
      onSaving(false);
    }
  };

  return (
    <Form
      id="dashboard-link"
      fill
      onSubmit={handleSubmit(save)}
      error={formState.errors.root?.server?.message}
    >
      <Controller
        name="linkTitle"
        control={control}
        rules={{
          required: 'Enter a link title',
          maxLength: { value: 200, message: 'Keep the title to 200 characters' },
        }}
      >
        {({ field }) => (
          <Input label="Link title" autoComplete="off" maxLength={200} {...field} />
        )}
      </Controller>
      <Controller name="webAddress" control={control} rules={webAddressRules}>
        {({ field }) => (
          <Input
            label="Web address"
            type="url"
            placeholder="https://"
            autoComplete="off"
            maxLength={2000}
            {...field}
          />
        )}
      </Controller>
    </Form>
  );
};
