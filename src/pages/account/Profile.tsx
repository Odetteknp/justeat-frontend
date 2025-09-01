import React, { useEffect, useState, useCallback } from "react";
import { Form, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { api } from "../../services/api";
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
  avatar?: string;
}

export default function ProfilePage() {
  const { loading, allowed, user, logout } = useAuthGuard([], {
    autoRedirect: true,
    redirectDelayMs: 0,
    redirectTo: { unauthorized: "/login", forbidden: "/" },
  })
  const [form] = Form.useForm<UserProfile>();
  const [submitting, setSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     form.setFieldsValue(MOCK_USER);
  //     setAvatarUrl(MOCK_USER.avatar);
  //     setIsFetching(false);
  //   }, 600);
  //   return () => clearTimeout(t);
  // }, [form]);

  useEffect(() => {
    if (loading) return;

    if (!allowed) {
      return;
    }
    const initial: UserProfile = {
      username: (user as any)?.username ?? MOCK_USER.username,
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      role: user?.role ?? "customer",
      avatar: (user as any)?.avatar ?? MOCK_USER.avatar,
    }
    
    form.setFieldsValue(initial as any);
    setAvatarUrl(initial.avatar)
    setIsFetching(false)
  }, [loading, allowed, user, form])

  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob: ")) URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  const handleAvatarChange = useCallback((info: UploadChangeParam) => {
    const file = info.file.originFileObj as File | undefined;
    if (!file) return;

    const nextUrl = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
        return nextUrl
    });
    message.success("เปลี่ยนรูปโปรไฟล์เรียบร้อย ✅");
  }, []);

  const handleSave = useCallback(
    async (values: UserProfile) => {
      setSubmitting(true);
      try {
        const payload: ProfileUpdateDTO = {
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          address: values.address,
          avatar: avatarUrl, // ถ้า BE ต้องการเป็นไฟล์ ให้เปลี่ยนเป็น multipart/form-data
        };

        // ตัวอย่าง: ลองยิงจริงก็ได้ (ถ้าพร้อม)
        // await api.patch("/auth/me", payload);

        console.log("payload:", payload);
        message.success("บันทึกโปรไฟล์เรียบร้อย ✅");
      } catch (e: any) {
        message.error(e?.response?.data?.error || "บันทึกไม่สำเร็จ ❌ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setSubmitting(false);
      }
    },[avatarUrl]);

  if(!allowed) return null;

  return (
    <div className="profile-page">
      <PageHeader />
      <div className="content-grid">
        <AvatarCard
          isLoading={isFetching}
          avatarUrl={avatarUrl}
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