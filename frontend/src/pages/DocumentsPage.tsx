import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  FileImage,
  FileArchive,
  Download,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDocuments, useUploadDocument } from "../hooks/useApi";
import { useToast } from "../contexts/ToastContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocRecord {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: { firstName: string; lastName: string };
  fileUrl: string;
  createdAt: string;
}

const FILE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-red-500" />,
  docx: <FileArchive size={18} className="text-blue-500" />,
  doc: <FileArchive size={18} className="text-blue-500" />,
  png: <FileImage size={18} className="text-emerald-500" />,
  jpg: <FileImage size={18} className="text-emerald-500" />,
  jpeg: <FileImage size={18} className="text-emerald-500" />,
};

const FILE_BADGE_VARIANT: Record<string, "destructive" | "indigo" | "success"> =
  {
    pdf: "destructive",
    docx: "indigo",
    doc: "indigo",
    png: "success",
    jpg: "success",
    jpeg: "success",
  };

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [page] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useDocuments(page);
  const uploadMutation = useUploadDocument();

  const docs = ((data as { data?: DocRecord[] })?.data ?? []) as DocRecord[];
  const total = (data as { meta?: { total?: number } })?.meta?.total ?? 0;

  const handleFile = async (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type", "Allowed formats: PDF, DOCX, PNG, JPEG");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large", "Maximum allowed size is 20 MB");
      return;
    }
    try {
      await uploadMutation.mutateAsync(file);
      toast.success("Document uploaded!", `${file.name} saved to AWS S3.`);
    } catch {
      toast.error("Upload failed", "Please check your AWS S3 configuration.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15">
          <FolderOpen size={20} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Documents</h2>
          <p className="text-sm text-muted-foreground">
            Upload and manage files stored on AWS S3
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
          dragOver
            ? "border-cyan-500 bg-cyan-500/5"
            : "border-border bg-muted/30 hover:border-cyan-500/50 hover:bg-cyan-500/5",
        )}
      >
        <input
          ref={fileRef}
          type="file"
          id="document-file-input"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div
          className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3 transition-colors",
            dragOver ? "bg-cyan-500/20" : "bg-muted",
          )}
        >
          {uploadMutation.isPending ? (
            <Loader2 size={22} className="text-cyan-500 animate-spin" />
          ) : (
            <Upload
              size={22}
              className={dragOver ? "text-cyan-500" : "text-muted-foreground"}
            />
          )}
        </div>
        <p className="mb-1 font-medium text-foreground">
          {uploadMutation.isPending
            ? "Uploading to S3..."
            : dragOver
              ? "Drop to upload"
              : "Drag & drop files here"}
        </p>
        <p className="text-sm text-muted-foreground">
          PDF, DOCX, PNG, JPEG — max 20 MB
        </p>
      </div>

      {/* Document list */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              All Documents
            </CardTitle>
            <Badge variant="muted" className="ml-1 text-xs">
              {total}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-14">
              <FileText
                size={40}
                className="mx-auto mb-3 text-muted-foreground/20"
              />
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Drop a file above to get started
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-125">
              <div className="divide-y divide-border">
                {docs.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 group"
                  >
                    {/* File icon */}
                    <div className="flex items-center justify-center shrink-0 w-10 h-10 border rounded-xl bg-muted border-border">
                      {FILE_ICON[doc.fileType] ?? (
                        <FileText size={18} className="text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtSize(doc.fileSize)}
                        {" · "}
                        {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                        {" · "}
                        {formatDistanceToNow(new Date(doc.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {/* Type badge */}
                    <Badge
                      variant={FILE_BADGE_VARIANT[doc.fileType] ?? "muted"}
                      className="shrink-0 text-xs"
                    >
                      {doc.fileType.toUpperCase()}
                    </Badge>

                    {/* Download */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      className="transition-opacity opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10"
                    >
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={15} />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
