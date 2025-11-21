"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Trash2, Eye, Download, File } from "lucide-react";
import { Attachment } from "../../types";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onDelete: () => void;
}

function AttachmentPreview({ attachment, onDelete }: AttachmentPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = attachment.fileType.startsWith("image/");
  const isPDF = attachment.fileType === "application/pdf";

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <>
      <div className="relative group bg-muted/50 rounded-lg overflow-hidden border border-border hover:border-primary transition-all">
        {/* Preview */}
        <div className="h-20 flex items-center justify-center bg-muted/30 relative overflow-hidden">
          {isImage ? (
            <>
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <button
                  onClick={handlePreview}
                  className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-destructive text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center p-2 text-muted-foreground transition-colors group-hover:text-primary">
                {isPDF ? (
                  <File className="w-6 h-6 transition-transform group-hover:scale-110" />
                ) : (
                  <Paperclip className="w-6 h-6 transition-transform group-hover:scale-110" />
                )}
                <span className="text-[10px] text-center line-clamp-1 mt-1 max-w-full px-1">
                  {attachment.fileName}
                </span>
              </div>
              {/* Action Buttons for non-images */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handlePreview}
                  className="p-1 bg-primary/90 text-primary-foreground rounded transition-all hover:bg-primary hover:scale-110"
                  title="Preview"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 bg-destructive/90 text-white rounded transition-all hover:bg-destructive hover:scale-110"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-1.5 space-y-0.5">
          <p className="text-[10px] font-medium truncate">
            {attachment.fileName}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {(attachment.fileSize / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-3">
              <span className="truncate flex-1">{attachment.fileName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(attachment.fileUrl, "_blank")}
                className="gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-80px)] p-4">
            {isImage ? (
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="w-full h-auto rounded-lg"
              />
            ) : isPDF ? (
              <iframe
                src={attachment.fileUrl}
                className="w-full h-[70vh] rounded-lg"
                title={attachment.fileName}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <File className="w-20 h-20 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {attachment.fileName}
                </p>
                <p className="text-sm mb-4">
                  {(attachment.fileSize / 1024).toFixed(1)} KB
                </p>
                <Button
                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CardAttachmentsProps {
  attachments: Attachment[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

export function CardAttachments({
  attachments,
  onFileUpload,
  onDeleteAttachment,
}: CardAttachmentsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Paperclip className="w-4 h-4" />
          Attachments
        </label>
        <label className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group">
          <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <input
            type="file"
            multiple
            onChange={onFileUpload}
            className="hidden"
          />
        </label>
      </div>
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment._id}
              attachment={attachment}
              onDelete={() => onDeleteAttachment(attachment._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
