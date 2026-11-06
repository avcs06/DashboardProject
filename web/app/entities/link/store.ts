import { createPersistentStore } from '@packages/utils/state';

import { linkSeed } from './seed';

import type { Link } from './types';

type LinkState = { records: Link[] };

/** Every Link, saved in the browser so a reload keeps what the user changed. */
export const useLinkStore = createPersistentStore<LinkState>(
  () => ({ records: linkSeed }),
  'weave:20261104-2339-dashboard-editor:link',
);
