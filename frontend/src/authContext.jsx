import { useState } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("userId"));

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setCurrentUser(null);
        window.location.href = "/auth";
    };

    const value = {
        currentUser,
        setCurrentUser,
        logout,
        loading: false,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
