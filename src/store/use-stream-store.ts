import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StreamState {
  stream: MediaStream | null;
  isLive: boolean;
  cameraOn: boolean;
  micOn: boolean;
  title: string;
  category: string;
  
  // Actions
  setStream: (stream: MediaStream | null) => void;
  setCameraOn: (on: boolean) => void;
  setMicOn: (on: boolean) => void;
  setIsLive: (live: boolean) => void;
  setTitle: (title: string) => void;
  setCategory: (cat: string) => void;
  
  startStudio: () => Promise<void>;
  stopStudio: () => void;
  toggleLive: (userId: string) => Promise<void>;
  toggleMic: () => void;
}

export const useStreamStore = create<StreamState>((set, get) => ({
  stream: null,
  isLive: false,
  cameraOn: false,
  micOn: true,
  title: "",
  category: "Gaming",

  setStream: (stream) => set({ stream }),
  setCameraOn: (cameraOn) => set({ cameraOn }),
  setMicOn: (micOn) => set({ micOn }),
  setIsLive: (isLive) => set({ isLive }),
  setTitle: (title) => set({ title }),
  setCategory: (category) => set({ category }),

  startStudio: async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      set({ stream: ms, cameraOn: true });
      toast.success("Studio Ready! 🎥");
    } catch (err) {
      toast.error("Camera/Mic access denied. Please check browser permissions.");
    }
  },

  stopStudio: () => {
    const { stream, isLive } = get();
    stream?.getTracks().forEach(t => t.stop());
    set({ stream: null, cameraOn: false });
    if (isLive) {
      // We don't auto-stop live here to prevent accidental disconnects, 
      // but usually stopStudio means ending everything.
    }
  },

  toggleLive: async (userId: string) => {
    const { isLive, cameraOn, startStudio } = get();
    
    // Auto-start camera if not on
    if (!isLive && !cameraOn) {
      await startStudio();
    }

    const nextState = !isLive;
    const { error } = await supabase
      .from('profiles')
      .update({ is_live: nextState })
      .eq('id', userId);

    if (error) {
      toast.error("Network error: Could not update live status");
      return;
    }

    set({ isLive: nextState });
    if (nextState) {
      toast.success("YOU ARE LIVE! 🔴", {
        description: "Your followers have been notified.",
        style: { background: '#C17B74', color: 'white' }
      });
    } else {
      toast.info("Stream Ended");
    }
  },

  toggleMic: () => {
    const { stream, micOn } = get();
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !micOn);
      set({ micOn: !micOn });
    }
  }
}));
