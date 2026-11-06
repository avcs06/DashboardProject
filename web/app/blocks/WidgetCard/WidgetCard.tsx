'use client';

import { IconButton } from '@packages/ui/Button';
import { Card } from '@packages/ui/Card';
import { Checkbox } from '@packages/ui/Checkbox';
import { Link } from '@packages/ui/Link';
import { Numeral } from '@packages/ui/Numeral';
import { Tag } from '@packages/ui/Tag';
import { Caption, Paragraph, Time } from '@packages/ui/Typography';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

import type { ChecklistItem } from '@app/entities/checklistItem';
import type { Link as LinkRecord } from '@app/entities/link';
import type { Widget } from '@app/entities/widget';

const sizeLabels = { small: 'Small', medium: 'Medium', large: 'Large' } as const;

/** Only an http(s) address opens as a link; anything else renders as plain text. */
const isOpenable = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export type WidgetCardProps = {
  widget: Widget;
  items?: ChecklistItem[];
  links?: LinkRecord[];
  onIncrement?: (widget: Widget) => void;
  onDecrement?: (widget: Widget) => void;
  onToggleItem?: (item: ChecklistItem, tickedOff: boolean) => void;
  /** While a save for one row runs, its controls wait. */
  busy?: string;
  /** The dashboard page's editing controls for this widget, beside its title. */
  headerAction?: React.ReactNode;
  /** One row's editing controls, beside a checklist item or a link. */
  itemAction?: (item: ChecklistItem) => React.ReactNode;
  linkAction?: (link: LinkRecord) => React.ReactNode;
  /** The dashboard page's editing controls for this widget, under its content. */
  footer?: React.ReactNode;
  /** The landing page preview: title and content only, no size or timestamp. */
  minimal?: boolean;
};

/**
 * One widget's content without the card around it, so a CardList can draw
 * the card: the title with a human size label, the content, and the editing
 * controls the dashboard page passes in.
 */
export const WidgetCardBody = ({
  widget,
  items = [],
  links = [],
  onIncrement,
  onDecrement,
  onToggleItem,
  busy,
  headerAction,
  itemAction,
  linkAction,
  footer,
  minimal,
}: WidgetCardProps) => {
  const interactiveCounter = onIncrement !== undefined && onDecrement !== undefined;

  return (
    <>
      <div className="flex-row-gap-2 items-center">
        <h3 className="flex-fill-x min-w-0">
          <span className="font-display">{widget.widgetTitle}</span>
        </h3>
        {minimal ? null : (
          <Tag
            // xs keeps the size label quiet beside the widget's title in a dense card.
            size="xs"
          >
            {sizeLabels[widget.widgetSize]}
          </Tag>
        )}
        {headerAction}
      </div>
      {widget.widgetType === 'note' ? (
        widget.noteText ? (
          <Paragraph>{widget.noteText}</Paragraph>
        ) : (
          <Paragraph color="muted">No note text yet.</Paragraph>
        )
      ) : null}
      {widget.widgetType === 'counter' ? (
        <div className="flex-col-gap-2 items-start">
          {widget.counterLabel ? <Paragraph>{widget.counterLabel}</Paragraph> : null}
          <div className="flex-row-gap-2 items-center">
            {interactiveCounter ? (
              <IconButton
                tooltip="Decrease"
                aria-label={`Decrease ${widget.widgetTitle}`}
                loadingWithReason={busy === `counter-${widget.id}` ? 'Saving the change' : undefined}
                onClick={() => onDecrement(widget)}
              >
                <Minus />
              </IconButton>
            ) : null}
            <Numeral aria-live="polite">{widget.counterNumber}</Numeral>
            {interactiveCounter ? (
              <IconButton
                tooltip="Increase"
                aria-label={`Increase ${widget.widgetTitle}`}
                loadingWithReason={busy === `counter-${widget.id}` ? 'Saving the change' : undefined}
                onClick={() => onIncrement(widget)}
              >
                <Plus />
              </IconButton>
            ) : null}
          </div>
        </div>
      ) : null}
      {widget.widgetType === 'checklist' ? (
        items.length > 0 ? (
          <ul className="flex-col-gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex-row-gap-2 items-center">
                <div className="flex-fill-x min-w-0">
                  {onToggleItem ? (
                    <Checkbox
                      checked={item.tickedOff}
                      onCheckedChange={(tickedOff) => onToggleItem(item, tickedOff)}
                    >
                      {item.itemText}
                    </Checkbox>
                  ) : (
                    <Checkbox
                      checked={item.tickedOff}
                      // Read-only: the landing page preview shows ticked state and saves nothing.
                      readOnly
                      onCheckedChange={() => undefined}
                    >
                      {item.itemText}
                    </Checkbox>
                  )}
                </div>
                {itemAction ? itemAction(item) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Paragraph color="muted">No items yet.</Paragraph>
        )
      ) : null}
      {widget.widgetType === 'link_list' ? (
        links.length > 0 ? (
          <ul className="flex-col-gap-1">
            {links.map((link) => (
              <li key={link.id} className="flex-row-gap-2 items-center">
                <div className="flex-fill-x min-w-0">
                  {isOpenable(link.webAddress) ? (
                    <Link href={link.webAddress} target="_blank" rel="noopener noreferrer">
                      {link.linkTitle}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </Link>
                  ) : (
                    <span>{link.linkTitle}</span>
                  )}
                </div>
                {linkAction ? linkAction(link) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Paragraph color="muted">No links yet.</Paragraph>
        )
      ) : null}
      {footer}
      {minimal ? null : (
        <Caption>
          Last edited <Time value={widget.updatedAt} withTime />
        </Caption>
      )}
    </>
  );
};

/**
 * One widget as its own record: its title, its size and its content. Used
 * read-only on the landing page's preview, and live on the dashboard page,
 * where the counter's steppers and the checklist's boxes save through the
 * handlers the dashboard page passes in.
 */
export const WidgetCard = (props: WidgetCardProps) => (
  <Card>
    <WidgetCardBody {...props} />
  </Card>
);
