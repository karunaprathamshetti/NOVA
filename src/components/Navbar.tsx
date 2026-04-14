import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tv } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isAuth = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0" style={{ borderRadius: 0 }}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[var(--neon-glow)] transition-shadow group-hover:shadow-[var(--neon-glow-strong)]">
            <Tv className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-card-foreground tracking-tight">StreamFlow</span>
        </Link>

        {!isAuth && (
          <div className="flex items-center gap-3">
            <Button variant="default" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
