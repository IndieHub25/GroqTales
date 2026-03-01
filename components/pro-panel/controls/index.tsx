'use client';

/**
 * Shared Control Components for Pro Panel Sections
 * Matches reference theme: dark bg, white text, primary (#8a0000) accents
 * Compact controls with visible text sizes (min 12px labels, 13px inputs)
 */

import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// ============================================================
// NUMERIC SLIDER — Reference: "AI Creativity (Temp)" style
// ============================================================
interface SliderControlProps {
  label: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  suffix?: string;
}

/** Numeric slider control with min/max/step and formatted value display. */
export function SliderControl({
  label,
  description,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  showValue = true,
  suffix = '',
}: SliderControlProps) {
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-condensed uppercase tracking-wider text-xs text-white leading-tight max-w-[55%] block">
          {label}
        </span>
        {showValue && (
          <span className="text-base font-mono font-bold text-white bg-[#8a0000] px-3 py-1 rounded shrink-0 min-w-[3rem] text-center tabular-nums leading-none">
            {value}
            {suffix}
          </span>
        )}
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => onChange(values[0] ?? value)}
        className="w-full [&_[role=slider]]:bg-noir-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/40 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4"
      />
      {description && (
        <span
          className="block text-[10px] text-gray-500 mt-2 leading-tight"
          style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 400,
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {description}
        </span>
      )}
    </div>
  );
}

// ============================================================
// SELECT — Reference: dark bg, border-2 border-primary
// ============================================================
interface SelectControlProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: readonly T[] | readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
}

/** Dropdown select control with label and options. */
export function SelectControl<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  placeholder,
}: SelectControlProps<T>) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string'
      ? { value: opt as T, label: formatOptionLabel(opt) }
      : opt
  );

  return (
    <div className="space-y-1.5">
      <Label className="font-condensed uppercase tracking-wider text-xs text-white">
        {label}
      </Label>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-black border-2 border-noir-primary p-3 font-condensed font-bold uppercase text-sm text-white focus:ring-0 hover:border-white transition-colors overflow-hidden">
          <SelectValue
            placeholder={placeholder || 'Select...'}
            className="truncate"
          />
        </SelectTrigger>
        <SelectContent className="bg-black border-2 border-noir-primary text-white">
          {normalizedOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="font-condensed uppercase text-sm tracking-wider text-gray-300 focus:bg-noir-primary/20 focus:text-white cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================
// INPUT — Reference: bg-white border-4 border-black (in light card) or bg-black (in dark area)
// ============================================================
interface InputControlProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
}

/** Text input control with label. */
export function InputControl({
  label,
  description,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
}: InputControlProps) {
  return (
    <div className="space-y-1.5">
      <Label className="font-condensed uppercase tracking-wider text-xs text-white">
        {label}
      </Label>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="bg-black border-2 border-noir-primary p-3 font-condensed text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:border-white transition-colors"
      />
    </div>
  );
}

// ============================================================
// NUMBER INPUT
// ============================================================
interface NumberInputControlProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Numeric input control with min/max validation. */
export function NumberInputControl({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
}: NumberInputControlProps) {
  return (
    <div className="space-y-1.5">
      <Label className="font-condensed uppercase tracking-wider text-xs text-white">
        {label}
      </Label>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="bg-black border-2 border-noir-primary p-3 font-mono text-sm text-white focus:ring-0 focus:border-white transition-colors"
      />
    </div>
  );
}

// ============================================================
// TEXTAREA
// ============================================================
interface TextareaControlProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

/** Multi-line textarea control with character count. */
export function TextareaControl({
  label,
  description,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: TextareaControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <Label className="font-condensed uppercase tracking-wider text-xs text-white leading-tight">
          {label}
        </Label>
        {maxLength && (
          <span className="text-xs font-condensed text-gray-300 bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="bg-black border-2 border-noir-primary p-3 font-condensed text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:border-white resize-none transition-colors"
      />
    </div>
  );
}

// ============================================================
// SWITCH — dark row with primary accent toggle
// ============================================================
interface SwitchControlProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** On/off toggle switch with label and description. */
export function SwitchControl({
  label,
  description,
  checked,
  onChange,
}: SwitchControlProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <div className="space-y-0.5">
        <Label className="font-condensed font-bold uppercase tracking-widest text-sm text-white">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-gray-400 font-condensed uppercase tracking-wider">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-noir-primary"
      />
    </div>
  );
}

// ============================================================
// MULTI-SELECT — Reference: theme tag pills
// ============================================================
interface MultiSelectControlProps<T extends string> {
  label: string;
  description?: string;
  values: T[];
  options: readonly T[];
  onChange: (values: T[]) => void;
  maxSelections?: number;
}

/** Multi-select checkbox group for choosing multiple options. */
export function MultiSelectControl<T extends string>({
  label,
  description,
  values,
  options,
  onChange,
  maxSelections,
}: MultiSelectControlProps<T>) {
  const toggleOption = (option: T) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else if (!maxSelections || values.length < maxSelections) {
      onChange([...values, option]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Label className="font-condensed uppercase tracking-wider text-xs text-white leading-tight">
          {label}
        </Label>
        {maxSelections && (
          <span className="text-xs font-condensed text-gray-300 bg-white/10 px-1.5 py-0.5 rounded uppercase shrink-0">
            {values.length}/{maxSelections}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = values.includes(option);
          const isDisabled =
            !isSelected && maxSelections && values.length >= maxSelections;

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              disabled={isDisabled as boolean}
              className={`
                px-3 py-1 font-condensed text-sm uppercase tracking-wider border transition-colors
                ${
                  isSelected
                    ? 'bg-noir-primary text-white border-white'
                    : 'bg-black text-white border-gray-600 hover:bg-noir-primary'
                }
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {formatOptionLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TAGS INPUT
// ============================================================
interface TagsInputControlProps {
  label: string;
  description?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
}

/** Free-form tags input with add/remove chip UI. */
export function TagsInputControl({
  label,
  description,
  values,
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags = 10,
  maxLength = 50,
}: TagsInputControlProps) {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (values.length < maxTags && !values.includes(inputValue.trim())) {
        onChange([...values, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Label className="font-condensed uppercase tracking-wider text-xs text-white leading-tight">
          {label}
        </Label>
        <span className="text-xs font-condensed text-gray-300 bg-white/10 px-1.5 py-0.5 rounded uppercase shrink-0">
          {values.length}/{maxTags}
        </span>
      </div>
      {description && (
        <p className="text-[10px] font-condensed uppercase tracking-wider text-gray-500">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-condensed font-bold uppercase tracking-wider bg-noir-primary text-white border border-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-gray-300 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {values.length < maxTags && (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-black border-2 border-noir-primary p-2 font-condensed text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:border-white transition-colors"
        />
      )}
    </div>
  );
}

// ============================================================
// COLLAPSIBLE GROUP — "Core" (always open) / "Advanced" (collapsed)
// ============================================================
interface CollapsibleGroupProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Collapsible section wrapper with animated expand/collapse. */
export function CollapsibleGroup({
  title,
  defaultOpen = false,
  children,
}: CollapsibleGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.03] transition-colors group"
      >
        <h4 className="text-[11px] font-condensed font-bold uppercase tracking-[0.15em] text-gray-400 group-hover:text-gray-300 transition-colors">
          {title}
        </h4>
        <span
          className={`text-gray-500 text-xs font-condensed uppercase tracking-wider transition-transform duration-200 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-4">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// GRID LAYOUTS — tighter gaps for compact layout
// ============================================================
/** Responsive 2-column grid layout for controls. */
export function ControlGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

/** Single-row flex layout for inline controls. */
export function ControlRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

// ============================================================
// HELPER
// ============================================================
function formatOptionLabel(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
