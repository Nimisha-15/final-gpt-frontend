import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";
import custom_logo from "../assets/custom_logo.svg";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChats,
    theme,
    setTheme,
    user,
    navigate,
    logout,
    createNewchat,
    setChats,
    axios,
    fetchUserChats,
  } = useAppContext();
  const [search, setSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm("are u sure u want to delete this chat?");
      if (!confirm) return;
      const { data } = await axios.post(
        "/api/chat/delete-chat",
        { chatId },
        { withCredentials: true },
      );
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        const remainingChats = chats.filter((chat) => chat._id !== chatId);
        if (remainingChats.length > 0) {
          setSelectedChats(remainingChats[0]);
        } else {
          await createNewchat();
        }
        toast.success("Chat deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen md:min-w-60  p-3 border-slate-200 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border-r dark:border-[#035d7d8d] backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${
        !isMenuOpen && "max-md:-translate-x-full "
      }`}
    >
      {/* logo
      <img
        className="w-full max-w-48"
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt=""
      /> */}
      <div className="flex flex-col items-center mt-1">
        <div className="flex items-center gap-1">
          <img src={custom_logo} alt="" className="w-14 h-14 border-none " />
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            MyChatGPT
          </h1>
        </div>
      </div>

      {/* new chat button  */}
      <button
        onClick={createNewchat}
        className="flex justify-center items-center w-full py-2 mt-5 text-white bg-linear-to-r from-sky-600 to-sky-900 text-sm rounded-md cursor-pointer "
      >
        <span className="mr-4 text-xl ">+</span>New Chat
      </button>

      {/* Search Conversation  */}

      <div className="flex items-center gap-2 p-2 mt-3 border border-gray-500 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          className="text-md placeholder:text-gray-500 outline-none"
          placeholder="Search Conversation"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

      <div className="flex-1 overflow-y-auto overscroll-contain force-scrollbar mt-3 text-md space-y-2">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0].content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div
              key={chat._id}
              className="p-2 px-4 dark:bg-[#4277a5d4]/10 border border-gray-300 dark:border-[#2b53709d] rounded-md cursor-pointer flex justify-between group mt-2"
              onClick={() => {
                setSelectedChats(chat);
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>

                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
                alt=""
                onClick={(e) =>
                  toast.promise(deleteChat(e, chat._id), {
                    loading: "deleting chat...",
                  })
                }
              />
            </div>
          ))}
      </div>

      {/*  Images  */}

      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-2 mt-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
      >
        <img src={assets.gallery_icon} className="w-6 not-dark:invert " />

        <div className="flex flex-col text-md">
          <p>Created Images </p>
        </div>
      </div>

      {/* Credit Purchase Option  */}

      <div
        onClick={() => {
          navigate("/credits");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-1 p-2 mt-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
      >
        <img src={assets.diamond_icon} className="w-5 dark:invert" />

        <div className="flex flex-col text-sm overflow-y-auto">
          <p>Credits {user?.credits} </p>
          <p className="text-sm whitespace-nowrap text-zinc-400 ">
            Purchase Credits to use Quick-GPTPro{" "}
          </p>
        </div>
      </div>

      {/* Dark Mode Toggler  */}

      <div className="flex items-center gap-2 p-2 mt-3 border border-gray-300 dark:border-white/15 rounded-md ">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4.5 not-dark:invert" />
          <p>Dark Mode </p>
          <label className="relative cursor-pointer inline-flex">
            <input
              onChange={() => {
                setTheme(theme === "dark" ? "light" : "dark");
              }}
              type="checkbox"
              className="sr-only peer "
              checked={theme === "dark"}
            />
            <div className="w-9 h-5 bg-gray-500 rounded-full peer-checked:bg-cyan-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-3 h-3  bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
          </label>
        </div>
      </div>

      {/* User Account  */}
      <div
        onClick={() => setIsProfileOpen(true)}
        className="flex items-center gap-3 p-2 mt-3 border border-gray-600 dark:border-white/15 rounded-md cursor-pointer group bg-[#82b5d9]/30 dark:bg-[#072024] hover:bg-[#82b5d9]/50 dark:hover:bg-[#0a3a47] transition-all duration-200"
      >
        <img src={assets.user_icon} className=" w-9 rounded-full  " />
        <p className="flex-1 text-md dark:text-[#eaecec] truncate">
          {user ? user.name : "Login your Account "}
        </p>
        <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <img
        onClick={() => {
          setIsMenuOpen(false);
        }}
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-4 cursor-pointer md:hidden not-dark:invert "
        alt=""
      />
    </div>
  );
};

export default Sidebar;
