import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "src/store/chat";
import { useAuth } from "src/hooks/authContext";
import ChatWindow from "./ChatWindow";
import { formatDateTH } from "src/helpers/formatDate";
import { MdSearch, MdChat } from "react-icons/md";
import { io } from "socket.io-client";
import ModalPayDown from "src/components/modals/modelPayDown";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const ChatPage = () => {
  const dispatch = useDispatch();
  const { setIsLoadingOpen } = useAuth();
  const {
    data: conversations = [],
    isLoading = true,
    total = 0,
  } = useSelector((state) => state.chat || {});
  const [Modal, setModal] = React.useState(false);
  const [contactCodeFromUrl, setContactCodeFromUrl] = React.useState(null);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 30;

  const handleContactClick = (e, conversation) => {
    e.stopPropagation();
    // สมมติว่า object 'conversation' ที่ได้จาก API ของคุณมี object `productSale` ที่มี `code` อยู่ข้างใน
    // คุณอาจจะต้องปรับ `conversation.productSale?.code` ให้ตรงกับโครงสร้างข้อมูลจริงของคุณ
    // เช่น อาจจะเป็น `conversation.contactCode`
    const contactCode = conversation.customer?.code;

    if (contactCode) {
      setModal(true);
      setContactCodeFromUrl(contactCode);
    }
  };

  // Effect for fetching data
  useEffect(() => {
    setIsLoadingOpen(true);
    dispatch(fetchConversations({ page, limit }))
      .unwrap()
      .finally(() => setIsLoadingOpen(false));
  }, [dispatch, setIsLoadingOpen, page, limit]);

  // Effect for real-time list updates
  useEffect(() => {
    const socket = io(WEBSOCKET_URL, { transports: ["websocket"] });

    socket.on("conversationUpdated", () => {
      // Refetch the conversation list when any message is sent/received
      dispatch(fetchConversations({ page, limit }));
    });

    return () => socket.disconnect();
  }, [dispatch, page, limit]);

  const filteredConversations =
    conversations?.filter((conv) =>
      conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-lg overflow-hidden">
      <ModalPayDown
        open={Modal}
        setModal={setModal}
        contactCodeFromUrl={contactCodeFromUrl}
      />

      {/* Sidebar with conversation list */}
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdChat size={24} />
            <h2 className="text-xl font-semibold">แชทลูกค้า</h2>
          </div>
          <div className="relative mt-4">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาลูกค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">กำลังโหลด...</p>
          ) : (
            <ul>
              {filteredConversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200 ${
                    selectedConversation?.id === conv.id ? "bg-indigo-100" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {!conv.adminHasReplied && (
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      )}
                      <p className="font-semibold">
                        <span
                          className="text-blue-500 cursor-pointer hover:underline"
                          onClick={(e) => handleContactClick(e, conv)}
                        >
                          {conv.customer.code}
                        </span>
                        {` (${conv.customer.name})`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {conv.lastMessage
                        ? formatDateTH(conv.lastMessage?.create_date)
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage?.content || "ยังไม่มีข้อความ"}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && conversations.length < total && (
            <div className="p-4 text-center">
              <button
                onClick={() => setPage((prevPage) => prevPage + 1)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
              >
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="hidden md:flex w-2/3 flex-col">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>กรุณาเลือกการสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
