"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Image, FileText, File } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'text' | 'other';
}

export function FileUpload({ 
  onFilesChange, 
  maxFiles = 5, 
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'text/*', '.pdf', '.doc', '.docx']
}: FileUploadProps) {
  const { t } = useI18n();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'text' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/') || file.type === 'application/pdf') return 'text';
    return 'other';
  };

  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`文件大小不能超过 ${maxFileSize}MB`);
      return;
    }

    const newUploadedFiles: UploadedFile[] = [];
    for (const file of files) {
      const type = getFileType(file);
      const preview = await createFilePreview(file);
      newUploadedFiles.push({ file, preview, type });
    }

    const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const getFileIcon = (type: 'image' | 'text' | 'other') => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadedFiles.length >= maxFiles}
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={index} className="flex items-center gap-2 bg-muted rounded-md p-2 text-sm">
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.file.name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                getFileIcon(uploadedFile.type)
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{uploadedFile.file.name}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
