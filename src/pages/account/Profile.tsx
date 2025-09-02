import React, { useEffect, useState, useCallback } from "react";
import { Form, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { api } from "../../services/api";
import { getToken } from "../../services/tokenStore";
import "./Profile.css";

import PageHeader from "../../components/account/PageHeader";
import AvatarCard from "../../components/account/AvatarCard";
import ProfileForm from "../../components/account/ProfileForm";
import type { UserProfile } from "../../types";

const MOCK_USER: UserProfile = {
  username: "gowit123",
  email: "gowit@example.com",
  firstName: "โกวิท",
  lastName: "ภูอ่าง",
  phoneNumber: "0812345678",
  address: "กรุงเทพมหานคร",
  role: "ลูกค้า",
  avatar: "https://i.pravatar.cc/150?img=3",
};

// type req backend
type ProfileUpdateDTO = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  const { loading, allowed, user } = useAuthGuard([], {
    autoRedirect: true,
    redirectDelayMs: 0,
    redirectTo: { unauthorized: "/login", forbidden: "/" },
  });
  const [form] = Form.useForm<UserProfile>();
  const [submitting, setSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  // ✅ ฟังก์ชันโหลด avatar แบบ blob
  const fetchAvatar = useCallback(async () => {
    try {
      const token = getToken();
      const res = await api.get("/auth/me/avatar", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);
      setAvatarUrl(blobUrl);
    } catch (e) {
      console.error("โหลด avatar ไม่ได้", e);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!allowed) return;

    const initial: UserProfile = {
      username: (user as any)?.username ?? MOCK_USER.username,
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      role: user?.role ?? "customer",
    };
    form.setFieldsValue(initial as any);

    if (user?.avatarUrl) {
      fetchAvatar(); // ✅ โหลด blob แทนการสร้าง URL string
    } else {
      setAvatarUrl(MOCK_USER.avatar);
    }

    setIsFetching(false);
  }, [loading, allowed, user, form, fetchAvatar]);

  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // อัปโหลด Avatar
  const handleAvatarChange = useCallback(async (info: UploadChangeParam) => {
    const file = info.file.originFileObj as File | undefined;
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAvatar(); // ✅ โหลดใหม่หลังอัปโหลด
      message.success("อัปโหลดรูปโปรไฟล์เรียบร้อย");
    } catch (e: any) {
      message.error(e?.response?.data?.error || "อัปโหลดไม่สำเร็จ");
    }
  }, [fetchAvatar]);

  // บันทึกข้อมูลอื่น
  const handleSave = useCallback(
    async (values: UserProfile) => {
      setSubmitting(true);
      try {
        const payload: ProfileUpdateDTO = {
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        };

        await api.patch("/auth/me", payload);
        const refreshed = await api.get("/auth/me");
        form.setFieldsValue({
          email: refreshed.data.user.email,
          firstName: refreshed.data.user.firstName,
          lastName: refreshed.data.user.lastName,
          phoneNumber: refreshed.data.user.phoneNumber,
          address: refreshed.data.user.address,
          role: refreshed.data.user.role,
        });

        if (refreshed.data.user.avatarUrl) {
          await fetchAvatar(); // ✅ โหลด blob ใหม่หลังบันทึก
        }
        message.success("บันทึกโปรไฟล์เรียบร้อย");
      } catch (e: any) {
        message.error(e?.response?.data?.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setSubmitting(false);
      }
    },
    [form, fetchAvatar]
  );

  if (!allowed) return null;

  return (
    <div className="profile-page">
      <PageHeader />
      <div className="content-grid">
        <AvatarCard
          isLoading={isFetching}
          avatarUrl={avatarUrl || MOCK_USER.avatar}
          role={form.getFieldValue("role")}
          email={form.getFieldValue("email")}
          onChangeAvatar={handleAvatarChange}
        />
        <ProfileForm
          form={form}
          isLoading={isFetching}
          submitting={submitting}
          onSubmit={handleSave}
        />
      </div>
    </div>
  );
}
