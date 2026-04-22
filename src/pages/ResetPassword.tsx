import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NeonSpinner from "@/components/NeonSpinner";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (Supabase handles the URL hash/link automatically)
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setError("Invalid or expired reset link. Please request a new one.");
      }
      setSessionLoading(false);
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully! 🎉");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return <div className="min-h-screen pt-24"><NeonSpinner /></div>;
  }

  return (
    <div className="gradient-bg min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="modal-card w-full max-w-md p-8 space-y-6" style={{ animation: "fade-in-up 0.6s ease-out forwards" }}>
        {error ? (
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-[#C17B74]" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Link Expired</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="primary" onClick={() => navigate("/login")} className="w-full">
              Back to Login
            </Button>
          </div>
        ) : success ? (
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-[#C17B74]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2D1F1E] dark:text-[#F5E8E6]">Password Updated!</h1>
            <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-card-foreground">Set new password</h1>
              <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
            </div>

            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="neu-input w-full h-12 pl-11 pr-12 text-sm bg-background text-foreground"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="neu-input w-full h-12 pl-11 pr-12 text-sm bg-background text-foreground"
                  disabled={loading}
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Minimum 8 characters required</p>
              )}

              <Button variant="primary" className="w-full" size="lg" disabled={loading}>
                {loading ? <NeonSpinner /> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
