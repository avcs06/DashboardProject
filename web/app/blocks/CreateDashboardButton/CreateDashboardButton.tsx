'use client';

import { createDashboard } from '@app/entities/dashboard';
import { Button } from '@packages/ui/Button';
import { toast } from '@packages/ui/Toast';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

/**
 * The frame's Create action: creates a dashboard named 'Untitled dashboard'
 * and opens it in the editor. A second press while it runs does nothing;
 * when creating fails, the list stays as it was and a toast offers to try
 * Create again.
 */
export const CreateDashboardButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const dashboard = await createDashboard({ dashboardName: 'Untitled dashboard' });
      router.push(`/dashboards/${dashboard.id}`);
    } catch {
      toast({
        title: 'Could not create your dashboard',
        description: 'Try again.',
        status: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Button
      leftIcon={<Plus />}
      loadingWithReason={creating ? 'Creating your dashboard' : undefined}
      onClick={create}
      className={className}
    >
      Create
    </Button>
  );
};
