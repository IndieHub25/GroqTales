'use client';

/**
 * PresetManager Component
 * Manage, save, load, delete presets, plus import/export
 */

import {
  ArrowLeftRight,
  FolderOpen,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  selectIsModified,
  selectPresets,
  useProPanelStore,
} from '@/store/proPanelStore';

import { ImportExportDialog } from './ImportExportDialog';

/** Preset toolbar — save, load, delete, compare, reset, and import/export. */
export function PresetManager() {
  const { toast } = useToast();
  const currentPresetName = useProPanelStore((s) => s.currentPresetName);
  const isModified = useProPanelStore(selectIsModified);
  const savedPresets = useProPanelStore(selectPresets);
  const savePreset = useProPanelStore((s) => s.savePreset);
  const loadPreset = useProPanelStore((s) => s.loadPreset);
  const deletePreset = useProPanelStore((s) => s.deletePreset);
  const resetAll = useProPanelStore((s) => s.resetAll);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        variant: 'destructive',
      });
      return;
    }

    savePreset(newPresetName.trim(), newPresetDescription.trim() || undefined);
    setIsSaveDialogOpen(false);
    setNewPresetName('');
    setNewPresetDescription('');

    toast({
      title: 'Preset Saved',
      description: `"${newPresetName}" has been saved successfully.`,
    });
  };

  const handleLoadPreset = (key: string) => {
    loadPreset(key);
    toast({
      title: 'Preset Loaded',
      description: `Loaded "${savedPresets[key]?.name || key}" preset.`,
    });
  };

  const handleDeletePreset = (key: string, name: string) => {
    deletePreset(key);
    toast({
      title: 'Preset Deleted',
      description: `"${name}" has been removed.`,
    });
  };

  const handleReset = () => {
    resetAll();
    toast({
      title: 'Reset Complete',
      description: 'All parameters have been reset to defaults.',
    });
  };

  const presetList = Object.entries(savedPresets);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Current Preset Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-condensed uppercase tracking-wider">
            Active File:
          </span>
          <span className="font-marker text-xs uppercase tracking-widest text-white px-2 py-1 bg-noir-primary border-2 border-black">
            {currentPresetName}
            {isModified && <span className="text-yellow-300 ml-1">*</span>}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Save Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="px-3 py-1.5 text-[10px] font-condensed font-bold uppercase tracking-wider text-white border-2 border-white/20 hover:border-noir-primary hover:text-noir-primary transition-colors bg-black/60"
            >
              <Save className="w-3 h-3 inline-block mr-1" /> Save
            </button>
          </DialogTrigger>
          <DialogContent className="bg-gray-950 border-2 border-white/10 shadow-[0_0_30px_rgba(138,0,0,0.15)]">
            <DialogHeader>
              <DialogTitle className="font-marker uppercase tracking-widest text-white">
                Save Dossier
              </DialogTitle>
              <DialogDescription className="font-condensed text-gray-400 uppercase tracking-wider text-xs">
                Save your current parameter configuration as a new dossier.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="preset-name"
                  className="font-condensed font-bold uppercase text-xs tracking-wider text-gray-300"
                >
                  Dossier Name
                </Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Operation Codename"
                  className="bg-black/60 text-white border-2 border-white/10 p-3 font-condensed focus:border-noir-primary"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="preset-description"
                  className="font-condensed font-bold uppercase text-xs tracking-wider text-gray-300"
                >
                  Notes (optional)
                </Label>
                <Textarea
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  placeholder="Describe this dossier..."
                  className="bg-black/60 text-white border-2 border-white/10 p-3 font-condensed resize-none focus:border-noir-primary"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
                className="font-condensed font-bold uppercase tracking-wider border border-white/20 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleSavePreset}
                className="bg-noir-primary hover:bg-red-800 text-white font-marker uppercase tracking-widest px-6 py-2 border-2 border-black shadow-comic-red"
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Load Preset Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="px-3 py-1.5 text-[10px] font-condensed font-bold uppercase tracking-wider text-white border-2 border-white/20 hover:border-noir-primary hover:text-noir-primary transition-colors bg-black/60"
            >
              <FolderOpen className="w-3 h-3 inline-block mr-1" /> Load
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-black/95 border-2 border-white/20"
          >
            {presetList.length === 0 ? (
              <DropdownMenuItem
                disabled
                className="text-gray-500 font-condensed uppercase text-xs"
              >
                No dossiers saved
              </DropdownMenuItem>
            ) : (
              presetList.map(([key, preset]) => (
                <DropdownMenuItem
                  key={key}
                  className="flex items-center justify-between group text-white hover:text-noir-primary"
                >
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(key)}
                    className="flex-1 text-left"
                  >
                    <div className="font-condensed font-bold uppercase text-xs tracking-wider">
                      {preset.name}
                    </div>
                    {preset.description && (
                      <div className="text-[10px] text-gray-500 font-condensed line-clamp-1">
                        {preset.description}
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(key, preset.name);
                    }}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:text-noir-primary transition-opacity"
                    title="Delete dossier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleReset}
              className="text-noir-primary font-condensed font-bold uppercase text-xs tracking-wider"
            >
              <RotateCcw className="w-3 h-3 inline-block mr-1" /> Reset to
              Defaults
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import/Export Dialog */}
        <ImportExportDialog
          open={isImportExportOpen}
          onOpenChange={setIsImportExportOpen}
        />
        <button
          type="button"
          onClick={() => setIsImportExportOpen(true)}
          className="px-3 py-1.5 text-[10px] font-condensed font-bold uppercase tracking-wider text-white border-2 border-white/20 hover:border-noir-primary hover:text-noir-primary transition-colors bg-black/60"
        >
          <ArrowLeftRight className="w-3 h-3 inline-block mr-1" /> Transfer
        </button>
      </div>
    </div>
  );
}
