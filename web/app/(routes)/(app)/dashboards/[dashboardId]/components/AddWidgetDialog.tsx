'use client';

import { touchDashboard } from '@app/entities/dashboard';
import { WidgetTypeOptions, type WidgetType } from '@app/entities/enums';
import { createWidget } from '@app/entities/widget';
import { Button } from '@packages/ui/Button';
import { Card, CardGroup } from '@packages/ui/Card';
import { Dialog } from '@packages/ui/Dialog';
import { Controller, Form } from '@packages/ui/Form';
import { toast } from '@packages/ui/Toast';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';


const descriptions: Record<WidgetType, string> = {
  note: 'Plain text that stays put.',
  counter: 'A number you nudge up or down by one.',
  checklist: 'Items you tick off as your day changes.',
  link_list: 'Useful pages, opened from the dashboard.',
};

const defaults: Record<WidgetType, { widgetTitle: string; counterLabel?: string }> = {
  note: { widgetTitle: 'Untitled note' },
  counter: { widgetTitle: 'Untitled counter', counterLabel: 'Count' },
  checklist: { widgetTitle: 'Untitled checklist' },
  link_list: { widgetTitle: 'Untitled links' },
};

type WidgetChoice = { widgetType: WidgetType | '' };

/**
 * D03 Add a widget: choose one of the four widget types to add to the
 * dashboard. Adding saves a widget with a default title and workable
 * settings, updates the dashboard's last edited time and shows the new
 * widget with the others.
 */
export const AddWidgetDialog = ({
  dashboardId,
  position,
  open,
  onOpenChange,
}: {
  dashboardId: string;
  /** The position the new widget takes, after the others. */
  position: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { control, handleSubmit, setError, clearErrors, reset, watch, formState } = useForm<WidgetChoice>({
    defaultValues: { widgetType: '' },
  });
  const chosen = watch('widgetType');
  const addingRef = useRef(false);

  const close = () => {
    onOpenChange(false);
    reset();
    clearErrors();
  };

  const add = async ({ widgetType }: WidgetChoice) => {
    if (widgetType === '' || addingRef.current) return;
    addingRef.current = true;
    try {
      await createWidget({
        widgetType,
        widgetTitle: defaults[widgetType].widgetTitle,
        widgetSize: 'medium',
        counterLabel: defaults[widgetType].counterLabel,
        counterNumber: 0,
        dashboard: dashboardId,
        position,
      });
      await touchDashboard(dashboardId, {});
      toast({ title: 'Widget added', status: 'success' });
      close();
    } catch {
      setError('root.server', { message: 'The widget could not be added. Try again.' });
    } finally {
      addingRef.current = false;
    }
  };

  return (
    <Dialog
      title="Add a widget"
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button
            // Secondary: adding the widget carries the emphasis here.
            variant="base"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-widget"
            // Adding waits on a choice, then on the save.
            loadingWithReason={formState.isSubmitting ? 'Adding the widget' : undefined}
            disabledWithReason={chosen === '' ? 'Choose a widget type first' : undefined}
          >
            Add
          </Button>
        </>
      }
    >
      <Form
        id="add-widget"
        fill
        onSubmit={handleSubmit(add)}
        error={formState.errors.root?.server?.message}
      >
        <Controller
          name="widgetType"
          control={control}
          rules={{ required: 'Choose a widget type' }}
        >
          {({ field }) => (
            <CardGroup mode="single" label="Widget type" {...field}>
              {WidgetTypeOptions.map((option) => (
                <Card key={option.key} value={option.key}>
                  <strong>{option.label}</strong>
                  <span>{descriptions[option.key]}</span>
                </Card>
              ))}
            </CardGroup>
          )}
        </Controller>
      </Form>
    </Dialog>
  );
};
