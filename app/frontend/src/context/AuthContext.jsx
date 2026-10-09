import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
} from "../services/api";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("cloudcart_user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] =
    useState(() =>
      localStorage.getItem(
        "cloudcart_access"
      )
    );

  /* =========================
     SYNC USER
  ========================= */

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "cloudcart_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(
        "cloudcart_user"
      );
    }
  }, [user]);

  /* =========================
     TOKEN REFRESH LISTENER
  ========================= */

  useEffect(() => {
    const handleTokenRefresh = () => {
      const newAccessToken =
        localStorage.getItem(
          "cloudcart_access"
        );

      setAccessToken(newAccessToken);
    };

    window.addEventListener(
      "cloudcart-token-refreshed",
      handleTokenRefresh
    );

    return () => {
      window.removeEventListener(
        "cloudcart-token-refreshed",
        handleTokenRefresh
      );
    };
  }, []);

  /* =========================
     REGISTER
  ========================= */

  const register = async ({
    username,
    email,
    password,
  }) => {
    try {
      const data = await registerUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      return {
        success: true,
        user: data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to create account.",
      };
    }
  };

  /* =========================
     LOGIN
  ========================= */

  const login = async (
    username,
    password
  ) => {
    try {
      const data = await loginUser(
        username.trim(),
        password
      );

      localStorage.setItem(
        "cloudcart_access",
        data.access
      );

      localStorage.setItem(
        "cloudcart_refresh",
        data.refresh
      );

      const loggedInUser = {
        username: username.trim(),
      };

      localStorage.setItem(
        "cloudcart_user",
        JSON.stringify(loggedInUser)
      );

      setAccessToken(data.access);
      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Invalid username or password.",
      };
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    localStorage.removeItem(
      "cloudcart_access"
    );

    localStorage.removeItem(
      "cloudcart_refresh"
    );

    localStorage.removeItem(
      "cloudcart_user"
    );

    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated:
          Boolean(accessToken),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

