import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/use-auth-store";
import NeonSpinner from "@/components/NeonSpinner";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) throw new Error("No session found");

        const user = session.user;
        setSession(session);

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          // Create profile for new Google user
          const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "user";
          const username = fullName.toLowerCase().replace(/\s+/g, "_");
          
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            username: username,
            email: user.email!,
            avatar_url: user.user_metadata?.avatar_url || "",
            bio: "",
          });

          if (insertError) throw insertError;
          toast.success(`Welcome to StreamFlow, ${username}! 🎉`);
        } else {
          toast.success(`Welcome back, ${profile.username}! 👋`);
        }

        navigate("/dashboard");
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error("Google login failed. Please try again.");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, setSession]);

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <NeonSpinner />
        <p className="text-[#2D1F1E] dark:text-[#F5E8E6] font-medium">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
