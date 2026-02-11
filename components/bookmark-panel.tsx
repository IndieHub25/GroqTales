'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bookmark } from '@/hooks/use-reading-progress';
import { BookmarkIcon, Trash2, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onJump: (paragraphIndex: number) => void;
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  storyTitle: string;
}

export function BookmarkPanel({
  isOpen,
  onClose,
  bookmarks,
  onJump,
  onRemove,
  onClearAll,
  storyTitle,
}: BookmarkPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] p-0 border-4 border-black bg-white dark:bg-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(30,41,59,1)] z-[1001]">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-black dark:text-white">
              <BookmarkIcon className="h-6 w-6 text-amber-500 fill-amber-500" />
              Bookmarks
            </DialogTitle>
            <DialogDescription className="font-bold flex justify-between items-center text-muted-foreground">
              <span className="truncate mr-2 text-left">Saved positions for "{storyTitle}"</span>
              {bookmarks.length > 0 && onClearAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-auto p-0 font-black uppercase text-xs"
                  onClick={onClearAll}
                >
                  Clear All
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>

          <Separator className="bg-black/10 dark:bg-white/10 mb-6" />

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {bookmarks.length === 0 ? (
              <div className="text-center py-10 px-4 border-4 border-dashed border-black/10 dark:border-white/10">
                <BookmarkIcon className="h-12 w-12 text-muted mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-bold">No bookmarks yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Click the + button while reading!</p>
              </div>
            ) : (
              bookmarks
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-4 border-4 border-black bg-white dark:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black text-sm uppercase text-amber-600 dark:text-amber-500 mb-1">
                          Paragraph {bookmark.paragraphIndex + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saved {new Date(bookmark.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          onClick={() => {
                            const url = new URL(window.location.href);
                            url.hash = `p-${bookmark.paragraphIndex}`;
                            navigator.clipboard.writeText(url.toString());
                            // We don't have toast inherited here, so we rely on user feedback or just copy
                          }}
                          title="Copy Link to Position"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-100 dark:hover:bg-amber-900/40"
                          onClick={() => {
                            onJump(bookmark.paragraphIndex);
                            onClose();
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500"
                          onClick={() => onRemove(bookmark.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {bookmark.note && (
                      <p className="mt-3 text-sm font-bold border-l-4 border-amber-500 pl-3 py-1 bg-amber-50 dark:bg-amber-950/30 italic">
                        {bookmark.note}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
