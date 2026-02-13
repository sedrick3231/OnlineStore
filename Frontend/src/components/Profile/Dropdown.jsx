import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import "./dropdown.css";

const url = import.meta.env.VITE_BACKEND_URL;

const Dropdown = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const HandleLogout = async () => {
    try {
      const response = await fetch(`${url}/user/api/v1/logout`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      localStorage.removeItem("user");
    } catch (error) {
    } finally {
      navigate("/");
      window.location.reload();
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="dropdown-trigger">
          <Avatar className="dropdown-avatar" style={{ width: "32px", height: "32px" }}>
            <AvatarImage
              src={user?.image?.url}
              alt={user?.name || "User Avatar"}
              className="object-cover object-top"
            />
            <AvatarFallback className="dropdown-avatar-fallback">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dropdown-content w-72">
        
        <DropdownMenuSeparator className="dropdown-separator" />
        
        <DropdownMenuGroup>
          <Link to={"/dashboard"} className="dropdown-link">
            <DropdownMenuItem className="dropdown-item">
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link to={"/settings"} className="dropdown-link">
            <DropdownMenuItem className="dropdown-item">
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="dropdown-separator" />
        
        <button className="dropdown-logout-btn" onClick={HandleLogout}>
          <DropdownMenuItem className="dropdown-item dropdown-logout">
            <LogOut className="w-4 h-4 mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
