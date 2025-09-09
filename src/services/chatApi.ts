import { api } from "./api";

/** ห้องแชทผูกกับออเดอร์ */
export type ChatRoom = {
  id: number;
  orderId: number;
};

export type ChatMessage = {
  id: number;
  body: string;
  userSenderId: number;
  typeMessageId?: number;
  createdAt: string; // normalized
};

function normTs(x: any) {
  const t = x.createdAt ?? x.CreatedAt ?? x.created_at;
  return typeof t === "string" ? t.replace(/(\.\d{3})\d+/, "$1") : t;
}

export const chatApi = {
  /** ห้องทั้งหมดของผู้ใช้ปัจจุบัน (ทั้งลูกค้า/ไรเดอร์) */
  listRooms: async (): Promise<ChatRoom[]> => {
    const res = await api.get("/chatrooms");
    const arr = res.data.items ?? res.data;
    return (arr || []).map((r: any) => ({
      id: r.id,
      orderId: r.orderId ?? r.order_id,
    })) as ChatRoom[];
  },

  /** ข้อความในห้อง */
  listMessages: async (roomId: number): Promise<ChatMessage[]> => {
    const res = await api.get(`/chatrooms/${roomId}/messages`);
    const arr = res.data.items ?? res.data;
    return (arr || []).map((m: any) => ({
      id: m.id,
      body: m.body,
      userSenderId: m.userSenderId ?? m.user_sender_id,
      typeMessageId: m.typeMessageId ?? m.type_message_id,
      createdAt: normTs(m),
    })) as ChatMessage[];
  },

  /** ส่งข้อความ */
  sendMessage: async (roomId: number, body: string): Promise<void> => {
    await api.post(`/chatrooms/${roomId}/messages`, { body });
  },
};
