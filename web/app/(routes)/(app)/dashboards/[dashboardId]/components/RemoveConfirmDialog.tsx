'use client';

import { Button } from '@packages/ui/Button';
import { Dialog } from '@packages/ui/Dialog';
import { Paragraph } from '@packages/ui/Typography';
import React, { useEffect, useState } from 'react';

/**
 * A destructive confirm that stays open while the removal runs. Delete
 * retries after a failure, Cancel closes without changing anything, and when
 * the record is already gone Close leaves the page as it is now.
 */
export const RemoveConfirmDialog = ({
  open,
  onOpenChange,
  title,
  recordName,
  consequence,
  failureMessage,
  goneMessage,
  savingMessage,
  isGoneError,
  onConfirm,
  onConfirmed,
  onGoneClosed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  recordName: string;
  consequence: string;
  failureMessage: string;
  goneMessage: string;
  savingMessage: string;
  isGoneError: (error: unknown) => boolean;
  onConfirm: () => Promise<void>;
  onConfirmed: () => void;
  onGoneClosed: () => void;
}) => {
  const [phase, setPhase] = useState<'confirm' | 'saving' | 'error' | 'gone'>('confirm');

  useEffect(() => {
    if (open) setPhase('confirm');
  }, [open ]);

  const confirm = async () => {
    if (phase === 'saving') return;
    setPhase('saving');
    try {
      await onConfirm();
      onConfirmed();
    } catch (error) {
      setPhase(isGoneError(error) ? 'gone' : 'error');
    }
  };

  return (
    <Dialog
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      footer={
        phase === 'gone' ? (
          <Button onClick={onGoneClosed}>Close</Button>
        ) : (
          <>
            <Button
              // Secondary: the destructive confirm carries the emphasis here.
              variant="base"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              // Filled danger: confirming permanently removes the record.
              variant="danger"
              loadingWithReason={phase === 'saving' ? savingMessage : undefined}
              onClick={() => void confirm()}
            >
              Delete
            </Button>
          </>
        )
      }
    >
      {phase === 'gone' ? (
        <Paragraph color="muted">{goneMessage}</Paragraph>
      ) : (
        <div className="flex-col-gap-2">
          <Paragraph>{recordName}</Paragraph>
          <Paragraph color="muted">{consequence}</Paragraph>
          {phase === 'error' ? <Paragraph color="muted">{failureMessage}</Paragraph> : null}
        </div>
      )}
    </Dialog>
  );
};
