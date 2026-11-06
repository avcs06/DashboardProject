import { createPersistentStore } from '@packages/utils/state';

import { checklistItemSeed } from './seed';

import type { ChecklistItem } from './types';

type ChecklistItemState = { records: ChecklistItem[] };

/** Every ChecklistItem, saved in the browser so a reload keeps what the user changed. */
export const useChecklistItemStore = createPersistentStore<ChecklistItemState>(
  () => ({ records: checklistItemSeed }),
  'weave:20261104-2339-dashboard-editor:checklistItem',
);
