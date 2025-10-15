'use client';

import { useState, useEffect } from 'react';
import { Folder as FolderIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Folder, FolderFormData } from '@/lib/types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FolderFormData) => void;
  folder?: Folder | null; // null for create, Folder for edit
  parentFolderId?: string | null;
}

const FOLDER_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
];

const FOLDER_ICONS = [
  'Folder',
  'Archive',
  'Bookmark',
  'Star',
  'Heart',
  'Tag',
  'Briefcase',
  'Home',
  'Code',
  'Image',
  'Video',
  'Music',
  'Gamepad2',
  'Coffee',
  'Book',
];

export default function FolderModal({
  isOpen,
  onClose,
  onSave,
  folder,
  parentFolderId
}: FolderModalProps) {
  const [formData, setFormData] = useState<FolderFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Folder',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Populate form when folder changes
  useEffect(() => {
    if (folder && isOpen) {
      setFormData({
        name: folder.name,
        description: folder.description || '',
        color: folder.color || '#3B82F6',
        icon: folder.icon || 'Folder',
      });
    } else if (!folder && isOpen) {
      // Reset for create
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'Folder',
      });
    }
  }, [folder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const folderData = {
        ...formData,
        ...(parentFolderId && { parentId: parentFolderId })
      };
      await onSave(folderData);
      onClose();
    } catch {
      // Handle error silently or show user notification
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!folder;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            {isEditing ? 'Edit Folder' : 'Create New Folder'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your folder.'
              : 'Create a new folder to organize your links.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Folder Name *
            </label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add a description for this folder (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </label>
            <div className="grid grid-cols-9 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label htmlFor="icon" className="text-sm font-medium">
              Icon
            </label>
            <Select
              value={formData.icon}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span className="capitalize">{icon.toLowerCase()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-medium">{formData.name || 'Folder Name'}</div>
                {formData.description && (
                  <div className="text-sm text-gray-600">{formData.description}</div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Folder' : 'Create Folder')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}