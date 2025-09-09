// services/riderApplication.ts
import { api } from "./api";

// ถ้า backend รับ multipart (มีไฟล์) ให้ใช้ FormData
export type ApplyRiderDTO = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;

  address: string;
  vehiclePlate: string;
  license: string;
  driveCar: boolean;

  licenseFile?: File; // แนบไฟล์ใบขับขี่ (เลือก 1 ไฟล์)
};

// สมัคร (user)
export type ApplyRiderJSON = {
  vehiclePlate: string;
  license: string;
  driveCarPicture?: string; // base64 (data URL)
};

export async function applyRider(payload: ApplyRiderJSON) {
  console.log("[FE] POST /partner/rider-applications payload =", payload);
  const res = await api.post("/partner/rider-applications", payload);
  return res.data;
}

// list ของฉัน (user)
export async function listMyRiderApplications(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await api.get(`/partner/rider-applications/mine${q}`);
  return res.data.items ?? res.data;
}

// ——— Admin ———
export async function adminListRiderApplications(status: string = "pending") {
  const res = await api.get(`/partner/rider-applications?status=${status}`);
  return res.data.items ?? res.data;
}

export async function adminApproveRiderApplication(id: number) {
  console.log("[FE] PATCH /partner/rider-applications/%d/approve", id);
  const res = await api.patch(`/partner/rider-applications/${id}/approve`, {}); // body ว่างได้
  return res.data;
}

export async function adminRejectRiderApplication(id: number, reason: string) {
  console.log("[FE] PATCH /partner/rider-applications/%d/reject", id, { reason });
  const res = await api.patch(`/partner/rider-applications/${id}/reject`, { reason });
  return res.data;
}

// สถานะที่ฝั่ง BE ใช้: "pending" | "approved" | "rejected"
export async function listRiderApplications(status?: "pending" | "approved" | "rejected") {
  // admin: GET /partner/rider-applications?status=pending
  const { data } = await api.get("/partner/rider-applications", {
    params: status ? { status } : undefined,
  });
  // รองรับทั้ง {items:[]} หรือเป็น array ตรง ๆ
  return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
}

export async function approveRiderApplication(id: number) {
  const payload = {}; // ตอนนี้เราอยากส่ง body ว่าง
  console.log("[FE] approve request", {
    url: `/partner/rider-applications/${id}/approve`,
    method: "PATCH",
    payload,
  });

  const res = await api.patch(`/partner/rider-applications/${id}/approve`, payload);
  console.log("[FE] approve response", res.data);
  return res.data;
}

export async function rejectRiderApplication(id: number, reason?: string) {
  // admin: PATCH /partner/rider-applications/:id/reject
  await api.patch(`/partner/rider-applications/${id}/reject`, reason ? { reason } : undefined);
}



