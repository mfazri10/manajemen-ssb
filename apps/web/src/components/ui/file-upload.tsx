'use client';

import * as React from 'react';
import { UploadCloud, X, FileText, ImageIcon, Loader2 } from 'lucide-react';

export interface UploadedFile {
  file: File;
  previewUrl?: string;
}

interface FileUploadProps {
  /** Dipanggil setiap kali daftar file berubah (client-side; endpoint storage menyusul). */
  onChange?: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  uploading?: boolean;
}

/**
 * Komponen upload file drag-and-drop.
 * Saat ini beroperasi sisi klien (menyediakan objek File + preview). Endpoint
 * storage backend (dokumen siswa, bukti bayar, foto) akan menyambung lewat prop
 * onChange — lihat FRONTEND-UPDATE-PLAN.md item file-upload.
 */
export function FileUpload({
  onChange,
  accept,
  multiple = false,
  maxFiles = 5,
  label = 'Unggah file',
  hint = 'Klik atau seret file ke sini',
  disabled = false,
  uploading = false,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = React.useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list || disabled || uploading) return;
    const slot = multiple ? Math.max(0, maxFiles - files.length) : 1;
    const incoming = Array.from(list).slice(0, slot);
    const mapped: UploadedFile[] = incoming.map((file) => ({
      file,
      ...(file.type.startsWith('image/') ? { previewUrl: URL.createObjectURL(file) } : {}),
    }));
    const next = multiple ? [...files, ...mapped] : mapped;
    setFiles(next);
    onChange?.(next);
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange?.(next);
  };

  React.useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background hover:border-primary/40'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="w-6 h-6 text-primary" />
        )}
        <p className="text-2xs font-bold text-foreground">{label}</p>
        <p className="text-4xs text-muted-foreground font-medium">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || uploading}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, idx) => (
            <div key={`${f.file.name}-${idx}`} className="flex items-center gap-2.5 p-2 bg-card border border-border rounded-xl">
              {f.previewUrl ? (
                <img src={f.previewUrl} alt={f.file.name} className="w-8 h-8 rounded-lg object-cover border border-border" />
              ) : f.file.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-bold text-foreground truncate">{f.file.name}</p>
                <p className="text-4xs text-muted-foreground font-medium">{(f.file.size / 1024).toFixed(1)} KB</p>
              </div>
              {!disabled && !uploading && (
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
