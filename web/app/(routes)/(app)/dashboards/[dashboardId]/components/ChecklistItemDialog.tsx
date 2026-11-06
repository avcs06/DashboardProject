'use client';

import {
  createChecklistItem,
  updateChecklistItem,
} from '@app/entities/checklistItem';
import { touchDashboard } from '@app/entities/dashboard';
import { Button } from '@packages/ui/Button';
import { Dialog } from '@packages/ui/Dialog';
import { Controller, Form } from '@packages/ui/Form';
import { Input } from '@packages/ui/Input';
import { toast } from '@packages/ui/Toast';
import { Paragraph } from '@packages/ui/Typography';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';


type ItemText = { itemText: string };

/**
 * D05 Add an item and D06 Edit item: one unticked item goes onto a checklist
 * widget, or one item's text changes. Saving updates the dashboard's last
 * edited time and closes the dialog.
 */
export const ChecklistItemDialog = ({
  dashboardId,
  widgetId,
  itemId,
  initialText,
  position,
  open,
  onOpenChange,
}: {
  dashboardId: string;
  widgetId: string;
  /** Set to edit one item; left out to add a new one. */
  itemId?: string;
  initialText?: string;
  /** The position a new item takes, after the others. */
  position?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const editing = itemId !== undefined;
  const { control, handleSubmit, setError, reset, clearErrors, formState } = useForm<ItemText>({
    defaultValues: { itemText: initialText ?? '' },
  });
  const [gone, setGone] = useState(false);
  const savingRef = useRef(false);

  const close = () => {
    onOpenChange(false);
    reset({ itemText: initialText ?? '' });
    clearErrors();
    setGone(false);
  };

  const save = async ({ itemText }: ItemText) => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      if (editing) {
        await updateChecklistItem(itemId, { itemText: itemText.trim() });
      } else {
        await createChecklistItem({
          itemText: itemText.trim(),
          tickedOff: false,
          widget: widgetId,
          position: position ?? 0,
        });
      }
      await touchDashboard(dashboardId, {});
      toast({ title: 'Change saved', status: 'success' });
      close();
    } catch (error) {
      if (error instanceof Error && error.message === 'ChecklistItem not found') {
        setGone(true);
      } else {
        setError('root.server', {
          message: editing
            ? 'The edited text could not be saved. Try again.'
            : 'The item could not be saved. Try again.',
        });
      }
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <Dialog
      title={editing ? 'Edit item' : 'Add an item'}
      open={open}
      onOpenChange={onOpenChange}
      footer={
        gone ? (
          <Button onClick={close}>Close</Button>
        ) : (
          <>
            <Button
              // Secondary: saving the item carries the emphasis here.
              variant="base"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="checklist-item"
              loadingWithReason={formState.isSubmitting ? 'Saving the item' : undefined}
            >
              Save
            </Button>
          </>
        )
      }
    >
      {gone ? (
        <Paragraph color="muted">That item is gone.</Paragraph>
      ) : (
        <Form
          id="checklist-item"
          fill
          onSubmit={handleSubmit(save)}
          error={formState.errors.root?.server?.message}
        >
          <Controller
            name="itemText"
            control={control}
            rules={{
              required: 'Enter the item text',
              maxLength: { value: 200, message: 'Keep the item to 200 characters' },
            }}
          >
            {({ field }) => (
              <Input label="Item text" autoComplete="off" maxLength={200} {...field} />
            )}
          </Controller>
        </Form>
      )}
    </Dialog>
  );
};
