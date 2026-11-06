export type ChecklistItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  itemText: string;
  tickedOff: boolean;
  widget: string;
  position: number;
};

/** What a create takes: everything but the fields the store sets. */
export type ChecklistItemInput = Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>;
