import { createPersistentStore } from '@packages/utils/state';

import { widgetSeed } from './seed';

import type { Widget } from './types';

type WidgetState = { records: Widget[] };

/** Every Widget, saved in the browser so a reload keeps what the user changed. */
export const useWidgetStore = createPersistentStore<WidgetState>(
  () => ({ records: widgetSeed }),
  'weave:20261104-2339-dashboard-editor:widget',
);
