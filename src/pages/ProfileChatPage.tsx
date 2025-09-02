import React, { useState, useEffect } from "react";
import { Card, Input, Button, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./ProfileChatPage.css";

const { Text } = Typography;

type Message = {
  id: number;
  sender: "customer" | "rider";
  content: string;
  timestamp: string;
};

export default function ProfileChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // โหลด mock data (ภายหลังตรงนี้จะเปลี่ยนเป็น fetch API)
  useEffect(() => {
    const mockMessages: Message[] = [
      { id: 1, sender: "rider", content: "กำลังไปรับอาหารครับ 🚴‍♂️", timestamp: "10:00" },
      { id: 2, sender: "customer", content: "โอเคครับ ขอบคุณมาก 🙏", timestamp: "10:01" },
    ];
    setMessages(mockMessages);
  }, []);

  // ฟังก์ชันส่งข้อความ (เผื่อ backend)
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "customer", // สมมติ user คือ customer
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    // update state (mock)
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    // TODO: ภายหลังเปลี่ยนเป็นเรียก API หรือ socket.emit()
  };

  return (
    <Card title="แชทกับ Rider" className="chat-card">
      {/* แสดงข้อความ */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.sender === "customer" ? "me" : "other"}`}
          >
            <Avatar size="small" icon={<UserOutlined />} />
            <div className="chat-content">
              <Text>{msg.content}</Text>
              <div className="chat-time">{msg.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* กล่องพิมพ์ข้อความ */}
      <div className="chat-input">
        <Input.TextArea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="พิมพ์ข้อความ..."
          autoSize={{ minRows: 1, maxRows: 3 }}
        />
        <Button type="primary" onClick={sendMessage}>
          ส่ง
        </Button>
      </div>
    </Card>
  );
}
