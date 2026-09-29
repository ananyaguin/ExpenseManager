import { createContext, useContext } from "react";
import { AuthContext, useAuth } from "./AuthContext";

export const AppContext = AuthContext;

export const AppContextProvider = ({ children }) => {
  return children;
};

export const useAppContext = useAuth;
export default AppContext;