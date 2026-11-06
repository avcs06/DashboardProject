'use client';

import { CreateDashboardButton } from '@app/blocks/CreateDashboardButton';
import { DashboardRow } from '@app/blocks/DashboardRow';
import { NextLink } from '@app/components/NextLink';
import { Button } from '@packages/ui/Button';
import { SidebarMenuItem } from '@packages/ui/SidebarMenu';
import { Paragraph } from '@packages/ui/Typography';
import { LayoutDashboard } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import type { Dashboard } from '@app/entities/dashboard';

/**
 * The rows of the app's sidebar: one link per page.
 *
 * Put here:
 * - One `SidebarMenuItem` from `@packages/ui/SidebarMenu` per page, in the
 *   order the user needs them. Each row opens a route from
 *   `.weave/01-scaffold/routes.json`.
 * - Make each row a link: `as={NextLink}` with its `href`, using `NextLink`
 *   from `@app/components/NextLink`.
 * - Mark the current page's row `selected`, from `usePathname()` of
 *   `next/navigation`.
 * - Put a row's icon in `leftIcon`, and a count in `rightAddOn`.
 * - A list the user works through, such as their projects, is one row per
 *   item.
 *
 * Example:
 *   <SidebarMenuItem
 *     as={NextLink}
 *     href="/clients"
 *     selected={pathname.startsWith('/clients')}
 *   >
 *     Clients
 *   </SidebarMenuItem>
 *
 * PageLayout renders the sidebar as a `SidebarMenu`. It draws the width,
 * the background and the spacing. The rows scroll between
 * `AppSidebarHeader` and `AppSidebarFooter`. Return only the rows.
 *
 * Never put here:
 * - An `aside`, `nav`, `SidebarMenu`, list or wrapper. PageLayout draws
 *   them.
 * - A button, a field or text among the rows. Actions go in
 *   `AppSidebarHeader` or `AppSidebarFooter`.
 * - A page the header already links to, or a page no flow leads to.
 *
 * The line "The theme puts here" below names this app's items. Build those
 * and nothing else.
 *
 * The theme puts here: Rows: navigation, dashboard list.
 */
export const AppSidebar = ({
  dashboards,
  loading,
  error,
  retry,
}: {
  dashboards: Dashboard[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // A removed row took its focused control with it: move focus back to the
  // list's home link, and leave the removed dashboard's page when on it.
  const handleRowRemoved = (id: string) => {
    if (pathname === `/dashboards/${id}`) router.push('/dashboards');
    document.getElementById('sidebar-dashboards-home')?.focus();
  };

  if (loading) {
    return (
      <SidebarMenuItem as="div">
        <Paragraph color="muted">Loading your dashboards…</Paragraph>
      </SidebarMenuItem>
    );
  }

  if (error) {
    return (
      <SidebarMenuItem as="div">
        <div className="flex-col-gap-2 items-start">
          <Paragraph>Dashboards could not be loaded.</Paragraph>
          <Button onClick={retry}>Try again</Button>
        </div>
      </SidebarMenuItem>
    );
  }

  if (dashboards.length === 0) {
    return (
      <SidebarMenuItem as="div">
        <div className="flex-col-gap-2 items-start">
          <Paragraph>No dashboards yet. Create your first dashboard to start your list.</Paragraph>
          <CreateDashboardButton />
        </div>
      </SidebarMenuItem>
    );
  }

  // Most recently edited first.
  const ordered = [...dashboards].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <>
      <SidebarMenuItem
        as={NextLink}
        id="sidebar-dashboards-home"
        href="/dashboards"
        selected={pathname === '/dashboards'}
        leftIcon={<LayoutDashboard />}
      >
        Your dashboards
      </SidebarMenuItem>
      {ordered.map((dashboard) => (
        <DashboardRow
          key={dashboard.id}
          dashboard={dashboard}
          selected={
            pathname === `/dashboards/${dashboard.id}` ||
            pathname.startsWith(`/dashboards/${dashboard.id}/`)
          }
          onRowRemoved={handleRowRemoved}
        />
      ))}
    </>
  );
};
