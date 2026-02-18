'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookmarkIcon } from 'lucide-react';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  paragraphIndex: number;
}

export function AddBookmarkDialog({
  isOpen,
  onClose,
  onConfirm,
  paragraphIndex,
}: AddBookmarkDialogProps) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] border-4 border-black bg-white dark:bg-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(30,41,59,1)] z-[1003]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-black dark:text-white">
            <BookmarkIcon className="h-6 w-6 text-emerald-500 fill-emerald-500" />
            Save Position
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground">
            Paragraph {paragraphIndex + 1}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="block text-sm font-black uppercase mb-2">Optional Note:</label>
          <Textarea
            placeholder="e.g., Important plot twist, read this again later..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-4 border-black rounded-none focus-visible:ring-0 focus-visible:border-emerald-500 min-h-[100px] font-bold"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-4 border-black rounded-none font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-4 border-black rounded-none font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Save Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
