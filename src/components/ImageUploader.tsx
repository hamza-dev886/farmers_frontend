
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  previews: { file: File, url: string }[];
  onRemovePreview: (url: string) => void;
  maxFiles?: number;
}

export function ImageUploader({ onFilesChange, previews, onRemovePreview, maxFiles = 5 }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="w-10 h-10" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
          <p className="text-sm">Maximum {maxFiles} images</p>
        </div>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {previews.map((p) => (
            <div key={p.url} className="relative aspect-square border rounded-md overflow-hidden group">
              <img src={p.url} alt={`preview`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute top-1 right-1 bg-background/60 rounded-full p-1 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemovePreview(p.url)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
