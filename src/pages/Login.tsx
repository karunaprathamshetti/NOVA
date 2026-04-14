import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="gradient-bg min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="modal-card w-full max-w-md p-8 space-y-6" style={{ animation: "fade-in-up 0.6s ease-out forwards" }}>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-card-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your StreamFlow account</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neu-input w-full h-12 pl-11 pr-4 text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neu-input w-full h-12 pl-11 pr-4 text-sm"
            />
          </div>

          <Button variant="primary" className="w-full" size="lg">
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
