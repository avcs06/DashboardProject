'use client';

import { touchDashboard } from '@app/entities/dashboard';
import {
  updateCounterDetails,
  updateNoteText,
  updateWidgetTitle,
  useGetWidget,
} from '@app/entities/widget';
import { Button } from '@packages/ui/Button';
import { Dialog } from '@packages/ui/Dialog';
import { Controller, Form } from '@packages/ui/Form';
import { Input, NumberInput } from '@packages/ui/Input';
import { Textarea } from '@packages/ui/Textarea';
import { toast } from '@packages/ui/Toast';
import { Paragraph } from '@packages/ui/Typography';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';


type WidgetSettings = {
  widgetTitle: string;
  noteText: string;
  counterLabel: string;
  counterNumber: number | null;
};

/**
 * D04 Configure widget: set a widget's title and the content and settings
 * for its type. Saving updates the dashboard's last edited time and shows
 * the widget with its new title and content.
 */
export const ConfigureWidgetDialog = ({
  dashboardId,
  widgetId,
  open,
  onOpenChange,
}: {
  dashboardId: string;
  widgetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: widget, loading } = useGetWidget(widgetId);
  const [gone, setGone] = useState(false);
  const [saving, setSaving] = useState(false);
  const widgetGone = (!loading && widget === undefined) || gone;

  return (
    <Dialog
      title="Configure widget"
      open={open}
      onOpenChange={onOpenChange}
      footer={
        widgetGone ? (
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        ) : (
          <>
            <Button
              // Secondary: saving the changes carries the emphasis here.
              variant="base"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="configure-widget"
              // Saving disables the button, so a second press does nothing.
              loadingWithReason={saving ? 'Saving the changes' : undefined}
            >
              Save
            </Button>
          </>
        )
      }
    >
      {loading || widget === undefined || gone ? (
        <Paragraph color="muted">
          {loading && !gone ? 'Loading the widget…' : 'That widget is gone.'}
        </Paragraph>
      ) : (
        <ConfigureForm
          key={`${widget.id}-${widget.updatedAt}`}
          dashboardId={dashboardId}
          widgetId={widget.id}
          widgetType={widget.widgetType}
          defaults={{
            widgetTitle: widget.widgetTitle,
            noteText: widget.noteText ?? '',
            counterLabel: widget.counterLabel ?? '',
            counterNumber: widget.counterNumber,
          }}
          onSaved={() => onOpenChange(false)}
          onGone={() => setGone(true)}
          onSaving={setSaving}
        />
      )}
    </Dialog>
  );
};

const ConfigureForm = ({
  dashboardId,
  widgetId,
  widgetType,
  defaults,
  onSaved,
  onGone,
  onSaving,
}: {
  dashboardId: string;
  widgetId: string;
  widgetType: string;
  defaults: WidgetSettings;
  onSaved: () => void;
  onGone: () => void;
  onSaving: (saving: boolean) => void;
}) => {
  const { control, handleSubmit, setError, formState } = useForm<WidgetSettings>({
    defaultValues: defaults,
  });
  const savingRef = useRef(false);

  const save = async (values: WidgetSettings) => {
    if (savingRef.current) return;
    savingRef.current = true;
    onSaving(true);
    try {
      await updateWidgetTitle(widgetId, { widgetTitle: values.widgetTitle.trim() });
      if (widgetType === 'note') {
        await updateNoteText(widgetId, { noteText: values.noteText });
      }
      if (widgetType === 'counter') {
        await updateCounterDetails(widgetId, {
          counterLabel: values.counterLabel,
          counterNumber: values.counterNumber ?? 0,
        });
      }
      await touchDashboard(dashboardId, {});
      toast({ title: 'Change saved', status: 'success' });
      onSaved();
    } catch (error) {
      if (error instanceof Error && error.message === 'Widget not found') {
        onGone();
      } else {
        setError('root.server', { message: 'The changes could not be saved. Try again.' });
      }
    } finally {
      savingRef.current = false;
      onSaving(false);
    }
  };

  return (
    <Form
      id="configure-widget"
      fill
      onSubmit={handleSubmit(save)}
      error={formState.errors.root?.server?.message}
    >
      <Controller
        name="widgetTitle"
        control={control}
        rules={{
          required: 'Enter a widget title',
          maxLength: { value: 120, message: 'Keep the title to 120 characters' },
        }}
      >
        {({ field }) => <Input label="Widget title" autoComplete="off" maxLength={120} {...field} />}
      </Controller>
      {widgetType === 'note' ? (
        <Controller
          name="noteText"
          control={control}
          rules={{
            maxLength: { value: 5000, message: 'Keep the note to 5000 characters' },
          }}
        >
          {({ field }) => (
            <Textarea
              label="Note text"
              labelRightSlot={`${field.value.length}/5000`}
              helpText="Plain text kept on the dashboard."
              rows={4}
              {...field}
            />
          )}
        </Controller>
      ) : null}
      {widgetType === 'counter' ? (
        <>
          <Controller
            name="counterLabel"
            control={control}
            rules={{
              maxLength: { value: 120, message: 'Keep the label to 120 characters' },
            }}
          >
            {({ field }) => <Input label="Counter label" autoComplete="off" maxLength={120} {...field} />}
          </Controller>
          <Controller
            name="counterNumber"
            control={control}
            rules={{
              required: 'Enter a whole number',
              validate: (value) =>
                value === null || Number.isInteger(value) || 'Enter a whole number',
            }}
          >
            {({ field }) => (
              <NumberInput
                label="Counter number"
                autoComplete="off"
                allowDecimal={false}
                {...field}
              />
            )}
          </Controller>
        </>
      ) : null}
      {widgetType === 'checklist' ? (
        <Paragraph color="muted">
          Its items are added, ticked, edited and removed on the dashboard itself.
        </Paragraph>
      ) : null}
      {widgetType === 'link_list' ? (
        <Paragraph color="muted">
          Its links are added, edited, removed and opened on the dashboard itself.
        </Paragraph>
      ) : null}
    </Form>
  );
};
