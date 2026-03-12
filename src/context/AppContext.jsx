import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// default url
axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loadingUser, setLoadingUser] = useState(true); // Fixed typo: setloadingUser → setLoadingUser
  const [token, settoken] = useState(localStorage.getItem("token") || null);

  // Fetch authenticated user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        withCredentials: true,
      });

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Create a new chat
  const createNewchat = async () => {
    try {
      if (!user) {
        toast.error("Login to create a new chat");
        return;
      }

      const { data } = await axios.get("/api/chat/create-chat", {
        withCredentials: true,
      });

      if (data.createdChat) {
        setChats((prev) => [data.createdChat, ...prev]);
        setSelectedChats(data.createdChat);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create chat");
    }
  };

  // Fetch all user chats
  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get-chat", {
        withCredentials: true,
      });

      if (data.success) {
        setChats(data.chats || []);

        if (data.chats && data.chats.length === 0) {
          // Auto-create first chat if none exist
          await createNewchat();
        } else if (data.chats && data.chats.length > 0) {
          setSelectedChats(data.chats[0]); // Select the most recent chat
        }
      } else {
        setChats([]);
        setSelectedChats(null);
      }
    } catch (error) {
      setChats([]);
      setSelectedChats(null);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post("/api/user/logout", {}, { withCredentials: true });
    } catch (err) {
      // Error logging out - continue with cleanup
    } finally {
      setUser(null);
      setChats([]);
      setSelectedChats(null);
      navigate("/login");
    }
  };

  // Effects
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChats(null);
    }
  }, [user]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // Removed empty useEffect

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    fetchUserChats,
    logout,
    chats,
    setChats,
    selectedChats,
    setSelectedChats,
    theme,
    setTheme,
    createNewchat,
    loadingUser,
    token,
    settoken,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
