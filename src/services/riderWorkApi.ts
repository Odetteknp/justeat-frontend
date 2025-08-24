import type { RiderWork } from "../context/RiderContext";

// mock queue ตัวอย่าง
const queue: RiderWork[] = [
  {
    id: 101, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    order_id: 5001, rider_id: 1, rider_work_status_id: 1,
    status_code: "ASSIGNED", status_label: "มอบหมายแล้ว",
    order_code: "ORD-5001", customer_name: "คุณเอ", restaurant_name: "ร้านกะเพราไฟลุก",
    pickup_address: "ซอย A เขต B", dropoff_address: "คอนโด C ชั้น 12",
    estimate_distance_km: 5.3, estimate_fee: 42
  },
  {
    id: 102, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    order_id: 5002, rider_id: 1, rider_work_status_id: 1,
    status_code: "ASSIGNED", status_label: "มอบหมายแล้ว",
    order_code: "ORD-5002", customer_name: "คุณบี", restaurant_name: "ข้าวมันไก่ป้าศรี",
    pickup_address: "ตลาด X", dropoff_address: "หมู่บ้าน Y",
    estimate_distance_km: 3.2, estimate_fee: 35
  },
];

export const riderWorkApi = {
  // เตรียม endpoint จริง:
  // GET /api/rider/works/active
  getActive: async (): Promise<RiderWork | null> => {
    await new Promise(r => setTimeout(r, 300));
    return null;
  },

  // POST /api/rider/works/pull-next
  pullNext: async (): Promise<RiderWork | null> => {
    await new Promise(r => setTimeout(r, 300));
    return queue.shift() || null;
  },

  // POST /api/rider/works/:id/start
  startWork: async (id: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 200));
  },

  // POST /api/rider/works/:id/complete
  completeWork: async (id: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 250));
  },

  // GET /api/rider/works/queue-count
  getQueueCount: async (): Promise<number> => {
    await new Promise(r => setTimeout(r, 120));
    return queue.length;
  },
};
