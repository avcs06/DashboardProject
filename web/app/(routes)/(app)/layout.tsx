'use client';

import { AppSidebar } from '@app/components/AppSidebar';
import { AppSidebarFooter } from '@app/components/AppSidebarFooter';
import { AppSidebarHeader } from '@app/components/AppSidebarHeader';
import { layouts, PageLayout } from '@app/components/PageLayout';
import { useCurrentUser } from '@app/entities/auth';
import { useListDashboards } from '@app/entities/dashboard';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

/** The app a signed-in user works in, in the theme's app layout. A visitor who is not signed in goes to the landing page. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const router = useRouter();
  // The frame's one dashboard-list subscription: the sidebar shows its
  // records, and the header hides its Create while the list is empty.
  const {
    data: dashboards,
    loading: dashboardsLoading,
    error: dashboardsError,
    retry: retryDashboards,
  } = useListDashboards();

  useEffect(() => {
    if (user === null) router.replace('/');
  }, [user, router]);

  // Undefined until the saved session is read.
  if (!user) return null;

  // While the list loads or fails, Create stays available: a load does not
  // yet know the list is empty, and creating does not need the list.
  const showCreate =
    dashboardsLoading || dashboardsError !== null || dashboards.length > 0;

  return (
    <PageLayout layout={layouts.app} kind="app" sidebarHeader={<AppSidebarHeader showCreate={showCreate} />} sidebar={<AppSidebar dashboards={dashboards} loading={dashboardsLoading} error={dashboardsError} retry={retryDashboards} />} sidebarFooter={<AppSidebarFooter />}>
      {children}
    </PageLayout>
  );
}
