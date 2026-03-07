'use client';

/**
 * ImportExportDialog Component
 * Export and import presets as JSON
 */

import { CheckCircle, Clipboard, Download, Save, Upload } from 'lucide-react';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useProPanelStore } from '@/store/proPanelStore';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Dialog for exporting/importing presets as JSON. */
export function ImportExportDialog({
  open,
  onOpenChange,
}: ImportExportDialogProps) {
  const { toast } = useToast();
  const { exportPresets, importPresets } = useProPanelStore();

  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('export');

  const handleCopyToClipboard = async () => {
    try {
      const json = exportPresets();
      await navigator.clipboard.writeText(json);
      toast({
        title: 'Copied!',
        description: 'Presets JSON copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste JSON to import.',
        variant: 'destructive',
      });
      return;
    }

    const result = importPresets(importText);

    if (result.success) {
      toast({
        title: 'Import Successful',
        description: `Imported ${result.count} preset(s).`,
      });
      setImportText('');
      onOpenChange(false);
    } else {
      toast({
        title: 'Import Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    try {
      const json = exportPresets();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `groqtales-presets-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded!',
        description: 'Presets file has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download presets.',
        variant: 'destructive',
      });
    }
  };

  const exportJson = exportPresets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-950 border-4 border-white/10 shadow-[0_0_40px_rgba(138,0,0,0.2)]">
        <DialogHeader>
          <DialogTitle className="font-marker text-white uppercase tracking-widest text-lg">
            Dossier Transfer Protocol
          </DialogTitle>
          <DialogDescription className="font-condensed text-gray-500 uppercase tracking-wider text-[10px]">
            Export classified dossiers or import intel from external sources.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/60 border-2 border-white/10 p-0.5 gap-0.5">
            <TabsTrigger
              value="export"
              className="font-condensed font-bold uppercase tracking-wider text-xs text-gray-400 data-[state=active]:bg-[#8a0000] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors py-2"
            >
              <Upload className="w-3.5 h-3.5 inline-block mr-1.5" /> Export
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="font-condensed font-bold uppercase tracking-wider text-xs text-gray-400 data-[state=active]:bg-[#8a0000] data-[state=active]:text-white data-[state=active]:shadow-none transition-colors py-2"
            >
              <Download className="w-3.5 h-3.5 inline-block mr-1.5" /> Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="font-condensed font-bold uppercase text-[10px] tracking-wider text-gray-400">
                Classified Dossiers (JSON)
              </label>
              <Textarea
                value={exportJson}
                readOnly
                rows={12}
                className="font-mono text-xs bg-black/80 text-green-400/90 border-2 border-white/10 focus:border-[#8a0000] rounded-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 font-condensed font-bold uppercase tracking-wider text-[10px] text-white bg-[#8a0000] hover:bg-red-800 border-2 border-black transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" /> Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 font-condensed font-bold uppercase tracking-wider text-[10px] text-white border-2 border-white/20 hover:border-[#8a0000] hover:text-[#8a0000] bg-black/60 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="font-condensed font-bold uppercase text-[10px] tracking-wider text-gray-400">
                Paste Classified Intel (JSON)
              </label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"preset-name": {"name": "...", ...}}'
                rows={12}
                className="font-mono text-xs bg-black/80 text-gray-300 border-2 border-white/10 focus:border-[#8a0000] rounded-none placeholder:text-gray-600"
              />
            </div>
            <div className="p-3 bg-black/40 border-l-4 border-[#8a0000] text-gray-400">
              <p className="font-condensed uppercase tracking-wider text-[10px]">
                <strong className="text-white">Notice:</strong> Importing will
                merge with existing dossiers. Files with matching keys will be
                overwritten.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 font-condensed font-bold uppercase tracking-wider text-[10px] text-white bg-[#8a0000] hover:bg-red-800 border-2 border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Validate & Import
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
