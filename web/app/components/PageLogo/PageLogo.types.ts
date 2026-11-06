import type { ReactNode } from 'react';

export type PageLogoProps = {
  /** Where the logo leads: the site's home by default, the dashboards home in the app frame. */
  href?: string;
  /** An icon before the name, such as the app's mark; it leads home with the name. */
  leftIcon?: ReactNode;
  /** An icon after the name; it leads home with the name. */
  rightIcon?: ReactNode;
};
