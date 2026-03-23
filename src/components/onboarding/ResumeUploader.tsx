import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface ResumeUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ResumeUploader = ({ file, onFileChange }: ResumeUploaderProps) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFileChange(accepted[0]);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <FileText className="h-5 w-5 text-primary" />
        <span className="flex-1 truncate text-sm text-foreground">{file.name}</span>
        <button onClick={() => onFileChange(null)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-foreground">Drag & drop your resume here</p>
      <p className="mt-1 text-xs text-muted-foreground">PDF only</p>
    </div>
  );
};

export default ResumeUploader;
