'use client';

import { NextLink } from '@app/components/NextLink';
import { PageHeader } from '@app/components/PageHeader';
import { useGetDashboard, useLastEditedDashboardId, useListDashboards } from '@app/entities/dashboard';
import { Button } from '@packages/ui/Button';
import { Card } from '@packages/ui/Card';
import { Paragraph, Time } from '@packages/ui/Typography';
import React from 'react';

const description =
  'Your dashboards stay in the list beside you as you work, most recently edited first.';

/**
 * S04 Your dashboards (/dashboards): pick up the dashboard the member
 * edited last, or start a new one. One column: the header, then the last
 * edited dashboard first, then the total count beside what it counts. The
 * last-edited dashboard comes only from the entity layer.
 */
export default function DashboardsPage() {
  const { data: dashboards, loading, error, retry } = useListDashboards();
  const { data: lastEditedId, loading: lastEditedLoading } = useLastEditedDashboardId();

  // Most recently edited first; the stored dashboard when it still exists.
  const ordered = [...dashboards].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const storedId = lastEditedId ?? ordered[0]?.id ?? '';
  const {
    data: lastDashboard,
    loading: lastLoading,
    error: lastError,
    retry: retryLast,
  } = useGetDashboard(storedId);

  if (loading || lastEditedLoading) {
    return (
      <>
        <PageHeader title="Your dashboards" description={description} />
        <Paragraph color="muted">Loading your dashboards…</Paragraph>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Your dashboards" description={description} />
        <div className="flex-col-gap-2 items-start">
          <Paragraph color="muted">Your dashboards could not be loaded.</Paragraph>
          <Button onClick={retry}>Try again</Button>
        </div>
      </>
    );
  }

  if (ordered.length === 0) {
    return (
      <>
        <PageHeader title="Your dashboards" description={description} />
        <div className="flex-col-gap-2 items-start">
          <Paragraph>No dashboard edited yet. You have no dashboards yet.</Paragraph>
          <Paragraph color="muted">
            Choose Create in the list beside you to create your first dashboard.
          </Paragraph>
        </div>
      </>
    );
  }

  // The stored dashboard was deleted in the meantime.
  if (lastEditedId !== null) {
    if (lastLoading) {
      return (
        <>
          <PageHeader title="Your dashboards" description={description} />
          <Paragraph color="muted">Loading your dashboards…</Paragraph>
        </>
      );
    }
    if (lastError) {
      return (
        <>
          <PageHeader title="Your dashboards" description={description} />
          <div className="flex-col-gap-2 items-start">
            <Paragraph color="muted">The dashboard you edited last could not be loaded.</Paragraph>
            <Button onClick={retryLast}>Try again</Button>
          </div>
        </>
      );
    }
    if (lastDashboard === undefined) {
      return (
        <>
          <PageHeader title="Your dashboards" description={description} />
          <div className="flex-col-gap-2 items-start">
            <Paragraph>The dashboard you edited last is gone.</Paragraph>
            <Paragraph color="muted">Choose a dashboard from the list beside you to keep working.</Paragraph>
            <Paragraph>
              You have {ordered.length} {ordered.length === 1 ? 'dashboard' : 'dashboards'} in total.
            </Paragraph>
          </div>
        </>
      );
    }
  }

  const last = lastEditedId !== null && lastDashboard !== undefined ? lastDashboard : ordered[0];

  return (
    <>
      <PageHeader title="Your dashboards" description={description} />
      <div className="flex-col-gap-4 items-start">
        <Card stretchLink>
          <h2>
            <NextLink look="plain" href={`/dashboards/${last.id}`}>
              {last.dashboardName}
            </NextLink>
          </h2>
          <Paragraph color="muted">
            The dashboard you edited last, last edited <Time value={last.updatedAt} withTime />.
          </Paragraph>
        </Card>
        <Paragraph>
          You have {ordered.length} {ordered.length === 1 ? 'dashboard' : 'dashboards'} in total.
        </Paragraph>
      </div>
    </>
  );
}
