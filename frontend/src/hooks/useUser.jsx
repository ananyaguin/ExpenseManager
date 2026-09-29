import { useAuth } from "../context/AuthContext";

export const useUser = () => {
  const { user, refreshUser, logout } = useAuth();
  return { user, refreshUser, clearUser: logout };
};

export default useUser;