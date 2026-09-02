import React from 'react';
import type { Status } from '../types';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-700 dark:text-gray-300' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 dark:text-blue-300' },
  BLOCKED: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
  OVERDUE: { label: 'Overdue', className: 'bg-orange-100 text-orange-800' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      config.className,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
