import { useState, useRef, useEffect } from "react";
import { X, Image, Video, Type, Upload, Send, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NeonSpinner from "./NeonSpinner";

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
  user: any;
  profile: any;
}

const CreatePostModal = ({ onClose, onSuccess, user, profile }: CreatePostModalProps) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'photo' | 'video' | 'text'>('text');
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (type === 'photo') {
      if (!selectedFile.type.startsWith('image/')) return toast.error("Please select an image file");
      if (selectedFile.size > 10 * 1024 * 1024) return toast.error("Image too large (Max 10MB)");
    }
    if (type === 'video') {
      if (!selectedFile.type.startsWith('video/')) return toast.error("Please select a video file");
      if (selectedFile.size > 40 * 1024 * 1024) return toast.error("Video too large (Max 40MB for your plan)");
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handlePost = async () => {
    if (type !== 'text' && !file) return toast.error("Please select a file to upload");
    if (!caption.trim() && type === 'text') return toast.error("Please write something!");

    setUploading(true);
    try {
      let mediaUrl = null;

      if (file) {
        const bucket = type === 'photo' ? 'post-images' : 'post-videos';
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        type,
        caption,
        media_url: mediaUrl,
      });

      if (insertError) throw insertError;

      toast.success("Post shared! 🎉");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div 
        className="modal-card w-full max-w-[520px] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#EDD9D6] dark:border-[#3D2A28] flex items-center justify-between">
          <h2 className="text-xl font-bold text-card-foreground">Create Post</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'photo', label: 'Photo', icon: Image },
              { id: 'video', label: 'Video', icon: Video },
              { id: 'text', label: 'Text', icon: Type },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setType(t.id as any); setFile(null); setPreviewUrl(null); }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                  type === t.id 
                    ? 'border-[#C17B74] bg-[#C17B74]/10 shadow-[0_0_12px_rgba(193,123,116,0.2)]' 
                    : 'border-transparent glass-card hover:bg-[#C17B74]/5'
                }`}
              >
                <t.icon className={`w-8 h-8 ${type === t.id ? 'text-[#C17B74]' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-bold ${type === t.id ? 'text-[#C17B74]' : 'text-muted-foreground'}`}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Step 2: Media Upload */}
          {type !== 'text' && (
            <div className="space-y-4">
              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[200px] border-2 border-dashed border-[#EDD9D6] dark:border-[#3D2A28] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#C17B74] hover:bg-[#C17B74]/5 transition-all group"
                >
                  <Upload className="w-10 h-10 text-[#C17B74] mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-[0.7rem] text-muted-foreground/60 mt-1 uppercase tracking-widest">
                    {type === 'photo' ? 'JPG, PNG, GIF up to 10MB' : 'MP4, WEBM up to 40MB'}
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#C17B74]/30 aspect-video bg-black">
                  {type === 'photo' ? (
                    <img src={previewUrl} className="w-full h-full object-contain" />
                  ) : (
                    <video src={previewUrl} controls className="w-full h-full" />
                  )}
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept={type === 'photo' ? 'image/*' : 'video/*'} 
              />
            </div>
          )}

          {/* Step 3: Caption */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Caption</label>
              <span className={`text-[0.6rem] font-mono ${caption.length > 400 ? 'text-[#C17B74]' : 'text-muted-foreground'}`}>
                {caption.length} / 500
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 500))}
              placeholder={type === 'text' ? "What's on your mind?" : "Write a caption..."}
              className="neu-input w-full p-4 min-h-[120px] resize-none text-sm"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#EDD9D6] dark:border-[#3D2A28]">
          <Button 
            variant="primary" 
            className="w-full h-12 text-md font-bold" 
            disabled={uploading}
            onClick={handlePost}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <NeonSpinner />
                <span>Posting... {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Share Post
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
