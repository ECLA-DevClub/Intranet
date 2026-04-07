import { useState, useEffect } from "react";
import { getStoredUser, type CurrentUser } from "@/lib/auth";

export function useUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoaded(true);

    // Optional: listen for storage events if user logs out from another tab
    const handleStorageChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "employee";
  const canManageDepartments = isAdmin || isManager;

  return { 
    user, 
    isLoaded, 
    isAdmin, 
    isManager, 
    isEmployee, 
    canManageDepartments 
  };
}
