/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken && savedToken !== "undefined" && savedToken !== "null" ? savedToken : null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const loginUser = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken = localStorage.getItem("token");
      const validToken =
        currentToken && currentToken !== "undefined" && currentToken !== "null"
          ? currentToken
          : null;
      setToken(validToken);

      try {
        const currentUser = localStorage.getItem("user");
        setUser(currentUser ? JSON.parse(currentUser) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
