'use client';

import React, { useState, useMemo } from 'react';
import {
  AI_STORY_PARAMETERS,
  PARAMETER_CATEGORIES,
  PARAMETER_PRESETS,
  AIStoryParameter,
  ParameterCategory,
  applyPreset,
  searchParameters,
} from '@/lib/ai-story-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '@/styles/parameter-panel.module.css';

interface ParameterPanelProps {
  onParameterChange?: (parameterId: string, value: any) => void;
  onParameterToggle?: (parameterId: string, enabled: boolean) => void;
  selectedParameters?: string[];
  defaultPreset?: string;
  compact?: boolean;
  showStats?: boolean;
}

/**
 * ParameterPanel Component
 * Allows users to select and configure 70+ AI story generation parameters
 * Organized by category with search, presets, and quick-access toggles
 */
export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  onParameterChange,
  onParameterToggle,
  selectedParameters = [],
  defaultPreset = 'standard',
  compact = false,
  showStats = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ParameterCategory>>(
    new Set(['character', 'plot'] as ParameterCategory[])
  );
  const [activeTab, setActiveTab] = useState('categories');

  // Search results
  const filteredParams = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchParameters(searchQuery);
  }, [searchQuery]);

  // Get enabled parameter count
  const enabledCount = useMemo(
    () => selectedParameters.length,
    [selectedParameters]
  );

  // Toggle category expansion
  const toggleCategory = (category: ParameterCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Apply preset
  const handlePresetClick = (presetKey: string) => {
    const preset = PARAMETER_PRESETS[presetKey];
    if (preset) {
      // Disable all, then enable only those in preset
      AI_STORY_PARAMETERS.forEach(p => {
        if (!preset.enabledParameterIds.includes(p.id)) {
          onParameterToggle?.(p.id, false);
        } else {
          onParameterToggle?.(p.id, true);
        }
      });
    }
  };

  return (
    <div className={`${styles.parameterPanel} ${compact ? styles.compact : ''}`}>
      {/* Header with Presets */}
      <div className={styles.header}>
        <h3 className={styles.title}>Parameters</h3>
        {showStats && (
          <Badge variant="outline" className={styles.enabledCount}>
            {enabledCount} enabled
          </Badge>
        )}
      </div>

      {/* Preset Buttons */}
      <div className={styles.presets}>
        {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            variant={defaultPreset === key ? 'default' : 'outline'}
            size="sm"
            className={styles.presetButton}
            onClick={() => handlePresetClick(key)}
            title={preset.description}
          >
            <span className={styles.presetIcon}>{preset.icon}</span>
            <span className={styles.presetName}>{preset.name}</span>
            <span className={styles.presetCount}>({preset.enabledParameterIds.length})</span>
          </Button>
        ))}
      </div>

      {/* Search Box */}
      <div className={styles.searchBox}>
        <Search className={styles.searchIcon} />
        <Input
          placeholder="Search parameters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs for View Modes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="enabled">Enabled Only</TabsTrigger>
          <TabsTrigger value="all">All Parameters</TabsTrigger>
        </TabsList>

        {/* Categories Tab - Shows search results or categorized list */}
        <TabsContent value="categories" className={styles.tabContent}>
          {searchQuery ? (
            <div className={styles.searchResults}>
              {filteredParams && filteredParams.length > 0 ? (
                <>
                  <p className={styles.resultCount}>
                    Found {filteredParams.length} parameter{filteredParams.length !== 1 ? 's' : ''}
                  </p>
                  <div className={styles.parameterList}>
                    {filteredParams.map(param => (
                      <ParameterRow
                        key={param.id}
                        parameter={param}
                        isEnabled={selectedParameters.includes(param.id)}
                        onToggle={() => onParameterToggle?.(param.id, !selectedParameters.includes(param.id))}
                        onChange={(value) => onParameterChange?.(param.id, value)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.noResults}>No parameters match your search</p>
              )}
            </div>
          ) : (
            <div className={styles.categories}>
              {PARAMETER_CATEGORIES.map((category) => {
                const categoryKey = category.key;
                const params = AI_STORY_PARAMETERS.filter(p => p.category === categoryKey);
                const isExpanded = expandedCategories.has(categoryKey);

                return (
                  <div key={categoryKey} className={styles.categoryGroup}>
                    <button
                      className={styles.categoryHeader}
                      onClick={() => toggleCategory(categoryKey)}
                    >
                      <span className={styles.categoryIcon}>{category.icon || '📁'}</span>
                      <div className={styles.categoryInfo}>
                        <span className={styles.categoryName}>{category.label}</span>
                        <span className={styles.categoryCount}>
                          {params.filter(p => selectedParameters.includes(p.id)).length}/{params.length}
                        </span>
                      </div>
                      <span className={styles.chevron}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className={styles.parameterList}>
                        {params.map(param => (
                          <ParameterRow
                            key={param.id}
                            parameter={param}
                            isEnabled={selectedParameters.includes(param.id)}
                            onToggle={() => onParameterToggle?.(param.id, !selectedParameters.includes(param.id))}
                            onChange={(value) => onParameterChange?.(param.id, value)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Enabled Only Tab */}
        <TabsContent value="enabled" className={styles.tabContent}>
          {selectedParameters.length > 0 ? (
            <div className={styles.parameterList}>
              {AI_STORY_PARAMETERS.filter(p => selectedParameters.includes(p.id)).map(param => (
                <ParameterRow
                  key={param.id}
                  parameter={param}
                  isEnabled={true}
                  onToggle={() => onParameterToggle?.(param.id, false)}
                  onChange={(value) => onParameterChange?.(param.id, value)}
                />
              ))}
            </div>
          ) : (
            <p className={styles.noResults}>No parameters enabled yet. Select a preset or enable parameters manually.</p>
          )}
        </TabsContent>

        {/* All Parameters Tab */}
        <TabsContent value="all" className={styles.tabContent}>
          <div className={styles.allParameters}>
            {AI_STORY_PARAMETERS.map(param => (
              <ParameterRow
                key={param.id}
                parameter={param}
                isEnabled={selectedParameters.includes(param.id)}
                onToggle={() => onParameterToggle?.(param.id, !selectedParameters.includes(param.id))}
                onChange={(value) => onParameterChange?.(param.id, value)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      {showStats && (
        <div className={styles.footer}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total parameters:</span>
            <span className={styles.statValue}>{AI_STORY_PARAMETERS.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Selected:</span>
            <span className={styles.statValue}>{enabledCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Coverage:</span>
            <span className={styles.statValue}>
              {Math.round((enabledCount / AI_STORY_PARAMETERS.length) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ParameterRow Component - Individual parameter control
 */
interface ParameterRowProps {
  parameter: AIStoryParameter;
  isEnabled: boolean;
  onToggle: () => void;
  onChange: (value: any) => void;
}

const ParameterRow: React.FC<ParameterRowProps> = ({
  parameter,
  isEnabled,
  onToggle,
  onChange,
}) => {
  return (
    <div className={`${styles.parameterRow} ${isEnabled ? styles.enabled : ''}`}>
      <div className={styles.parameterToggle}>
        <Checkbox
          id={parameter.id}
          checked={isEnabled}
          onCheckedChange={onToggle}
          className={styles.checkbox}
        />
        <div className={styles.parameterHeader}>
          <label htmlFor={parameter.id} className={styles.parameterName}>
            {parameter.name}
          </label>
          {parameter.helpText && (
            <p className={styles.helpText}>{parameter.helpText}</p>
          )}
        </div>
      </div>

      {/* Parameter Input - Only shown if enabled */}
      {isEnabled && (
        <div className={styles.parameterControl}>
          {/* Slider Type */}
          {parameter.type === 'slider' && parameter.constraints && (
            <div className={styles.sliderControl}>
              <Slider
                min={parameter.constraints.min ?? 0}
                max={parameter.constraints.max ?? 10}
                step={parameter.constraints.step ?? 1}
                defaultValue={[parameter.value ?? parameter.defaultValue]}
                onValueChange={(val) => onChange(val[0])}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>
                {parameter.value ?? parameter.defaultValue}
              </span>
            </div>
          )}

          {/* Select Type */}
          {parameter.type === 'select' && parameter.constraints?.options && (
            <Select
              defaultValue={parameter.value ?? parameter.defaultValue}
              onValueChange={onChange}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameter.constraints.options.map(option => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Text Type */}
          {parameter.type === 'text' && (
            <Input
              type="text"
              placeholder={parameter.description}
              defaultValue={parameter.value ?? parameter.defaultValue}
              onChange={(e) => onChange(e.target.value)}
              className={styles.textInput}
              maxLength={parameter.constraints?.maxLength}
            />
          )}

          {/* Textarea Type */}
          {parameter.type === 'textarea' && (
            <textarea
              placeholder={parameter.description}
              defaultValue={parameter.value ?? parameter.defaultValue}
              onChange={(e) => onChange(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          )}

          {/* Toggle Type */}
          {parameter.type === 'toggle' && (
            <div className={styles.toggleControl}>
              <input
                type="checkbox"
                id={`${parameter.id}-toggle`}
                defaultChecked={parameter.value ?? parameter.defaultValue}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.toggleInput}
              />
              <label htmlFor={`${parameter.id}-toggle`} className={styles.toggleLabel}>
                {(parameter.value ?? parameter.defaultValue) ? 'Enabled' : 'Disabled'}
              </label>
            </div>
          )}

          {/* Multiselect Type */}
          {parameter.type === 'multiselect' && parameter.constraints?.options && (
            <div className={styles.multiselectControl}>
              {parameter.constraints.options.map(option => (
                <div key={String(option.value)} className={styles.multiselectItem}>
                  <Checkbox
                    id={`${parameter.id}-${String(option.value)}`}
                    defaultChecked={
                      (parameter.value as string[])?.includes(String(option.value)) ?? false
                    }
                    onCheckedChange={(checked) => {
                      const current = parameter.value as string[] || [];
                      const optVal = String(option.value);
                      const updated = checked
                        ? [...current, optVal]
                        : current.filter((o: string) => o !== optVal);
                      onChange(updated);
                    }}
                  />
                  <label htmlFor={`${parameter.id}-${String(option.value)}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
