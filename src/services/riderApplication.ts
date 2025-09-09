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
  const res = await api.post("/partner/rider-applications", payload); // JSON!
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
  const res = await api.patch(`/partner/rider-applications/${id}/approve`, {});
  return res.data;
}

export async function adminRejectRiderApplication(id: number, reason: string) {
  const res = await api.patch(`/partner/rider-applications/${id}/reject`, { reason });
  return res.data;
}

