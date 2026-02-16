'use client';

import { PenLine, ImagePlus } from 'lucide-react';
import React, { useState } from 'react';

import { ImageStoryForm } from '@/components/image-story-form';
import { TextStoryForm } from '@/components/text-story-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CreateStoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="theme-gradient-bg text-white border-0 hover:opacity-90"
      >
        <PenLine className="w-4 h-4 mr-2" />
        Create Story
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="gradient-heading">
              Create a New Story
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="text" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="text"
                className="data-[state=active]:theme-gradient-bg data-[state=active]:text-white"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Text Story
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="data-[state=active]:theme-gradient-bg data-[state=active]:text-white"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Image Story
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <TextStoryForm onSuccess={() => setOpen(false)} />
            </TabsContent>

            <TabsContent value="image">
              <ImageStoryForm onSuccess={() => setOpen(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
