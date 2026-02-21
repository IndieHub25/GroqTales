'use client';

/**
 * @fileoverview Profile information form component.
 * @description Renders an editable form for user profile fields with validation,
 * or a read-only view of those fields when not in edit mode.
 */

import {
    Github,
    Globe,
    Link as LinkIcon,
    Mail,
    Save,
    Twitter,
    User,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EditableProfileFields } from '@/types/profile';

/** Maximum allowed length for the bio field. */
const BIO_MAX_LENGTH = 160;

/** Regex to check that a URL starts with http:// or https://. */
const URL_PROTOCOL_RE = /^https?:\/\//i;

/** Props for the ProfileInfoForm component. */
interface ProfileInfoFormProps {
    /** Initial field values to populate the form. Uses `name` (not `displayName`). */
    initialData: EditableProfileFields;
    /** Callback invoked with the validated, normalized data on successful save. */
    onSave: (data: EditableProfileFields) => void;
    /** Whether the form is in edit mode. When false, renders a read-only view. */
    isEditing: boolean;
}

/**
 * Normalizes a website URL by prepending `https://` if no protocol is present.
 * Returns an empty string for blank input.
 */
function normalizeWebsite(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (URL_PROTOCOL_RE.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

/**
 * Validates the editable profile fields.
 * Returns a record of field-level error messages (empty record means valid).
 */
function validateFields(data: EditableProfileFields): Partial<Record<keyof EditableProfileFields, string>> {
    const errors: Partial<Record<keyof EditableProfileFields, string>> = {};

    if (!data.name.trim()) {
        errors.name = 'Display name is required.';
    } else if (data.name.trim().length < 2) {
        errors.name = 'Display name must be at least 2 characters.';
    }

    if (data.website.trim() && !URL_PROTOCOL_RE.test(normalizeWebsite(data.website))) {
        errors.website = 'Website must start with http:// or https://.';
    }

    if (data.bio.length > BIO_MAX_LENGTH) {
        errors.bio = `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`;
    }

    return errors;
}

/**
 * Displays and edits a user's profile information.
 *
 * In edit mode, renders a form with validation for name, website, and bio.
 * On save, normalizes the website URL before calling `onSave`.
 * In read-only mode, renders the profile fields and social links as static content.
 */
export function ProfileInfoForm({
    initialData,
    onSave,
    isEditing,
}: ProfileInfoFormProps) {
    const [formData, setFormData] = React.useState<EditableProfileFields>(initialData);
    const [errors, setErrors] = React.useState<Partial<Record<keyof EditableProfileFields, string>>>({});

    // Sync form data if the parent provides new initialData (e.g. after an external update).
    React.useEffect(() => {
        setFormData(initialData);
        setErrors({});
    }, [initialData]);

    /** Handles input/textarea changes and clears the field-level error on edit. */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    /** Validates and submits the form, normalizing the website URL before saving. */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateFields(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSave({
            ...formData,
            name: formData.name.trim(),
            website: normalizeWebsite(formData.website),
        });
    };

    // ── Read-only view ──────────────────────────────────────────────────────────
    if (!isEditing) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Display Name
                        </h3>
                        <p className="text-lg font-bold">{formData.name}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Username
                        </h3>
                        <p className="text-lg font-mono">@{formData.username}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Bio
                        </h3>
                        <p className="text-base leading-relaxed">
                            {formData.bio || 'No bio provided.'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.website && (
                            <a
                                href={formData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{formData.website}</span>
                            </a>
                        )}
                        {formData.twitter && (
                            <a
                                href={`https://twitter.com/${formData.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-400 hover:underline"
                            >
                                <Twitter className="w-4 h-4" />
                                <span>@{formData.twitter}</span>
                            </a>
                        )}
                        {formData.github && (
                            <a
                                href={`https://github.com/${formData.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 hover:underline"
                            >
                                <Github className="w-4 h-4" />
                                <span>{formData.github}</span>
                            </a>
                        )}
                    </div>
                    {!formData.website && !formData.twitter && !formData.github && (
                        <p className="text-sm text-muted-foreground italic">No links added yet.</p>
                    )}
                </div>
            </div>
        );
    }

    // ── Edit form ───────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0"
                            placeholder="Your Name"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                    </div>
                    {errors.name && (
                        <p id="name-error" className="text-xs text-destructive mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground font-bold">@</span>
                        <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="pl-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0"
                            placeholder="username"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">
                        Bio{' '}
                        <span className={`text-xs font-normal ${formData.bio.length > BIO_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                            ({formData.bio.length}/{BIO_MAX_LENGTH})
                        </span>
                    </Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="min-h-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0 resize-none"
                        placeholder="Tell us about yourself..."
                        aria-invalid={!!errors.bio}
                        aria-describedby={errors.bio ? 'bio-error' : undefined}
                    />
                    {errors.bio && (
                        <p id="bio-error" className="text-xs text-destructive mt-1">
                            {errors.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Website */}
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="https://yourwebsite.com"
                                aria-invalid={!!errors.website}
                                aria-describedby={errors.website ? 'website-error' : undefined}
                            />
                        </div>
                        {errors.website && (
                            <p id="website-error" className="text-xs text-destructive mt-1">
                                {errors.website}
                            </p>
                        )}
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Handle</Label>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="twitter"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    {/* GitHub */}
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username</Label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="github"
                                name="github"
                                value={formData.github}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="opacity-50">Email (Read-only)</Label>
                        <div className="relative opacity-50 cursor-not-allowed">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="pl-9 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    className="bg-primary text-white font-bold border-2 border-black dark:border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
