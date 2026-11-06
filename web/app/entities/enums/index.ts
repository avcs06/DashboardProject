export const WidgetTypeOptions = [
  { key: 'note', label: "note" },
  { key: 'counter', label: "counter" },
  { key: 'checklist', label: "checklist" },
  { key: 'link_list', label: "link list" },
] as const;

export type WidgetType = (typeof WidgetTypeOptions)[number]['key'];

export const WidgetSizeOptions = [
  { key: 'small', label: "small" },
  { key: 'medium', label: "medium" },
  { key: 'large', label: "large" },
] as const;

export type WidgetSize = (typeof WidgetSizeOptions)[number]['key'];
