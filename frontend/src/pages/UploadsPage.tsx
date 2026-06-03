import { useRef, useState } from 'react';
import { ImagePlus, Upload, CheckCircle2, X, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUploadProfileImage } from '../hooks/useApi';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { cn } from '@/lib/utils';

export default function UploadsPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview]       = useState<string | null>(null);
  const [selectedFile, setSelected] = useState<File | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [uploaded, setUploaded]     = useState(false);

  const uploadMutation = useUploadProfileImage();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', 'Please select a JPEG, PNG or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Maximum allowed size is 5 MB');
      return;
    }
    setSelected(file);
    setUploaded(false);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadMutation.mutateAsync({ file: selectedFile });
      setUploaded(true);
      setSelected(null);
      toast.success('Profile updated!', 'Your photo has been saved to Cloudinary.');
    } catch {
      toast.error('Upload failed', 'Please check your Cloudinary configuration.');
    }
  };

  const cancel = () => { setSelected(null); setPreview(null); setUploaded(false); };

  const currentImage = preview
    || (uploaded ? user?.profileImage : null)
    || user?.profileImage
    || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.firstName}`;

  const roleName = (user?.role as { name?: string })?.name ?? 'USER';
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Camera size={20} className="text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Profile Image Upload</h2>
          <p className="text-sm text-muted-foreground">Upload your profile photo to Cloudinary CDN</p>
        </div>
      </div>

      {/* Current profile card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Current Profile</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-2xl border-2 border-border">
                <AvatarImage src={currentImage} alt="Profile" className="object-cover" />
                <AvatarFallback className="text-lg rounded-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              {uploaded && (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-lg">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="indigo">{roleName}</Badge>
                <Badge variant="muted">JPEG · PNG · WebP</Badge>
                <Badge variant="muted">Max 5 MB</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !selectedFile && fileRef.current?.click()}
        className={cn(
          'rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200',
          dragOver
            ? 'border-primary bg-primary/5 cursor-copy'
            : selectedFile
              ? 'border-border bg-card'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
        )}
      >
        <input
          ref={fileRef}
          type="file"
          id="profile-file-input"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mx-auto">
              <ImagePlus size={28} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>

            {uploadMutation.isPending && (
              <Progress value={undefined} className="h-1.5 w-48 mx-auto [&>div]:animate-pulse" />
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); cancel(); }}
                className="gap-2"
              >
                <X size={14} /> Cancel
              </Button>
              <Button
                id="upload-profile-btn"
                variant="gradient"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={uploadMutation.isPending}
                className="gap-2"
              >
                <Upload size={14} />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload to Cloudinary'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              'inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4 transition-colors',
              dragOver ? 'bg-primary/20' : 'bg-muted'
            )}>
              <ImagePlus size={24} className={dragOver ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <p className="font-medium text-foreground mb-1">
              {dragOver ? 'Drop your image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground">JPEG, PNG, WebP up to 5 MB</p>
          </>
        )}
      </div>
    </div>
  );
}
