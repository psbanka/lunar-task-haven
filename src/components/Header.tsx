import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTheme,
} from "@/contexts/ThemeContext";
import { LogOut, Moon, Sun, User } from "lucide-react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function Header() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } =
    useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <div className="">
          <Logo />
        </div>
        <div className="md:block ">
          <NavBar />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">{user.name}</span>

            {user.role === "admin" && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
