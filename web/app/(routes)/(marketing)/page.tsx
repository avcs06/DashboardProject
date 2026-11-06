'use client';

import { WidgetCard } from '@app/blocks/WidgetCard';
import { Hero } from '@app/components/Hero';
import { NextLink } from '@app/components/NextLink';
import { Button } from '@packages/ui/Button';
import { CardList } from '@packages/ui/Card';
import { Hash, Link2, ListChecks, StickyNote } from 'lucide-react';
import React from 'react';

import type { ChecklistItem } from '@app/entities/checklistItem';
import type { Widget } from '@app/entities/widget';

const previewWidgets: Widget[] = [
  {
    id: 'preview-note',
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    widgetType: 'note',
    widgetTitle: 'Launch plan',
    widgetSize: 'medium',
    noteText: 'Call the dentist at noon',
    counterNumber: 0,
    dashboard: 'preview',
    position: 0,
  },
  {
    id: 'preview-counter',
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    widgetType: 'counter',
    widgetTitle: 'Glasses of water',
    widgetSize: 'small',
    counterNumber: 3,
    dashboard: 'preview',
    position: 1,
  },
  {
    id: 'preview-checklist',
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    widgetType: 'checklist',
    widgetTitle: 'Today',
    widgetSize: 'medium',
    counterNumber: 0,
    dashboard: 'preview',
    position: 2,
  },
];

const previewItems: ChecklistItem[] = [
  {
    id: 'preview-item-1',
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    itemText: 'Review the draft',
    tickedOff: true,
    widget: 'preview-checklist',
    position: 0,
  },
  {
    id: 'preview-item-2',
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    itemText: 'Buy oat milk',
    tickedOff: false,
    widget: 'preview-checklist',
    position: 1,
  },
];

const reasons = [
  {
    id: 'notes',
    icon: <StickyNote aria-hidden className="icon-size-heading" />,
    title: 'Notes that stay put',
    line: 'Keep plain text notes on the same dashboard as everything else you track.',
  },
  {
    id: 'counters',
    icon: <Hash aria-hidden className="icon-size-heading" />,
    title: 'Counters you can nudge',
    line: 'Track a number with a label and move it up or down by one whenever it changes.',
  },
  {
    id: 'checklists',
    icon: <ListChecks aria-hidden className="icon-size-heading" />,
    title: 'Checklists you can tick off',
    line: 'Add items, tick them off and reword them as your day changes.',
  },
  {
    id: 'links',
    icon: <Link2 aria-hidden className="icon-size-heading" />,
    title: 'Links worth keeping',
    line: 'Save useful pages by title and web address, then open them from your dashboard.',
  },
];

/**
 * S01 Your day, all in one dashboard (/): the landing page. The hero holds
 * the headline, the line under it and the way to sign up beside a read-only
 * preview of a Morning routine dashboard, and the reasons follow in a grid.
 */
export default function LandingPage() {
  return (
    <>
      <Hero
        title="Your day, all in one dashboard"
        description="Build a personal dashboard of notes, counters, checklists and links, and keep the small things you track every day in one private place."
        actions={
          <Button as={NextLink} href="/sign-up">
            Create your first dashboard
          </Button>
        }
        media={
          <div className="flex-col-gap-4">
            <h2 className="font-display text-heading">Morning routine</h2>
            {previewWidgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                items={previewItems.filter((item) => item.widget === widget.id)}
                minimal
              />
            ))}
          </div>
        }
      />
      <CardList
        aria-label="What you can track"
        items={reasons}
        // Four reasons browsed side by side, in two rows of two.
        layout="grid"
        columns={2}
        renderItem={(reason) => (
          <>
            {reason.icon}
            <h3>{reason.title}</h3>
            <p>{reason.line}</p>
          </>
        )}
      />
    </>
  );
}
