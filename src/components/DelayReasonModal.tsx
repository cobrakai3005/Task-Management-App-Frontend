import React, { useState } from 'react';
import type { DelayCategory } from '../types';
import { AlertCircle, X } from 'lucide-react';

interface DelayReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: DelayCategory, note: string) => void;
  title?: string;
}

const CATEGORIES: DelayCategory[] = [
  'Technical Issue',
  'Waiting for Dependency',
  'Waiting for Approval',
  'Requirement Changed',
  'Client Delay',
  'Personal Emergency',
  'Workload / Capacity',
  'External Service Down',
  'Other'
];

const DelayReasonModal: React.FC<DelayReasonModalProps> = ({ isOpen, onClose, onSubmit, title = "Delay Reason Required" }) => {
  const [category, setCategory] = useState<DelayCategory | ''>('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && note.trim()) {
      onSubmit(category as DelayCategory, note.trim());
      setCategory('');
      setNote('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-red-50">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You are marking this task as Blocked or Overdue. Please provide a reason to maintain accountability.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason Category <span className="text-red-500">*</span></label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as DelayCategory)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            >
              <option value="" disabled>Select a category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Note <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Internet was down from 2 PM to 6 PM."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!category || !note.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DelayReasonModal;
