'use client';

import { UserMenu } from '@app/components/UserMenu';
import { Dropdown } from '@packages/ui/Dropdown';
import { LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * The right end of the public site's header bar.
 *
 * Put here, in this order:
 * - Sign up, as the main action. Use `Button as={NextLink}` with
 *   `href="/sign-up"`. Leave it out when the landing page's hero already
 *   offers it.
 * - The account. Code places `UserMenu` here when the theme puts the
 *   account at the right. It shows Sign in to a visitor and the account
 *   menu to a member. Keep it last, as it is.
 *
 * PageLayout draws the bar and lays these items in a row. Return only the
 * items: no wrapper, height, padding, background or border.
 *
 * Never put here:
 * - A page's own actions. They go in the page's `PageHeader`.
 *
 * The line "The theme puts here" below names this app's items. Build those
 * and nothing else.
 *
 * The theme puts here: It holds: account.
 */
export const MarketingHeaderRightSlot = () => {
  const router = useRouter();
  // No Sign up button: the landing page's hero already offers signing up,
  // and the design asks for Sign in only. Signed in, the menu links to the
  // member's dashboards before Sign out.
  return (
    <UserMenu placement="header" signInHref="/sign-in">
      <Dropdown.Item
        leftIcon={<LayoutDashboard />}
        onSelect={() => router.push('/dashboards')}
      >
        Your dashboards
      </Dropdown.Item>
    </UserMenu>
  );
};
