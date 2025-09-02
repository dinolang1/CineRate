import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadProfileImage, getDownloadUrl } from "@/lib/upload";

interface ProfileUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
}

export function ProfileUpload({ currentImageUrl, onImageUploaded }: ProfileUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Provjeri tip fajla
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Provjeri veličinu (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProfileImage(file);
      onImageUploaded(result.fileUrl);
      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (currentImageUrl) {
      // Izvuci filename iz URL-a
      const filename = currentImageUrl.split('/').pop();
      if (filename) {
        const downloadUrl = getDownloadUrl(filename);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={currentImageUrl} />
          <AvatarFallback className="text-2xl">
            {uploading ? "..." : "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          
          {currentImageUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="ml-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-400">
        Supported formats: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  );
}
