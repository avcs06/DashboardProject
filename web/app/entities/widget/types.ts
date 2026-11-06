import type { WidgetSize, WidgetType } from '../enums';

export type Widget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  widgetType: WidgetType;
  widgetTitle: string;
  widgetSize: WidgetSize;
  noteText?: string;
  counterLabel?: string;
  counterNumber: number;
  dashboard: string;
  position: number;
};

/** What a create takes: everything but the fields the store sets. */
export type WidgetInput = Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>;
