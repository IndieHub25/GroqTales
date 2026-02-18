'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark as BookmarkIcon, Trash2, MapPin } from 'lucide-react';
import { Bookmark } from '@/hooks/use-reading-progress';

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onJump: (index: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function BookmarkPanel({
  isOpen,
  onClose,
  bookmarks,
  onJump,
  onRemove,
  onClearAll,
}: BookmarkPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] border-4 border-black bg-white dark:bg-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(30,41,59,1)] z-[1003] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b-4 border-black bg-slate-50 dark:bg-slate-800">
          <div className="mb-2">
            <DialogTitle className="text-2xl font-black uppercase text-black dark:text-white flex items-center gap-2">
              <BookmarkIcon className="h-6 w-6 text-primary fill-primary" />
              Chronicles
            </DialogTitle>
          </div>
          <div className="flex items-center justify-between">
            <DialogDescription className="font-bold text-slate-500 dark:text-slate-400">
              {bookmarks.length} saved positions in this story
            </DialogDescription>
            {bookmarks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-auto p-0 text-xs font-black uppercase text-red-500 hover:text-red-600 hover:bg-transparent dark:hover:bg-transparent"
              >
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] p-6 bg-white dark:bg-slate-900">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center opacity-50">
              <BookmarkIcon className="h-12 w-12 mb-4" />
              <p className="font-bold">No bookmarks saved yet.</p>
              <p className="text-sm">Save interesting points as you read!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks
                .sort((a, b) => a.paragraphIndex - b.paragraphIndex)
                .map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group relative bg-white dark:bg-slate-800 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 uppercase">
                          P. {bookmark.paragraphIndex + 1}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(bookmark.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(bookmark.id)}
                        className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {bookmark.note && (
                      <p className="text-sm font-bold mb-4 italic text-slate-600 dark:text-slate-300">
                        "{bookmark.note}"
                      </p>
                    )}

                    <Button
                      onClick={() => { onJump(bookmark.paragraphIndex); onClose(); }}
                      className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-none font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      <MapPin className="h-3 w-3" />
                      Jump to Position
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
