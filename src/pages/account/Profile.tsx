import React, { useEffect, useState, useCallback } from "react";
import { Form, message } from "antd";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { getAvatarBase64, updateProfile, uploadAvatarBase64 } from "../../services/user";
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
  avatarBase64: "https://i.pravatar.cc/150?img=3", // ✅ fallback URL
};

type ProfileUpdateDTO = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
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
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(); // ✅ เปลี่ยนชื่อ
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // โหลด profile + avatar
  useEffect(() => {
    if (loading || !allowed) return;

    const initial: UserProfile = {
      username: (user as any)?.username ?? MOCK_USER.username,
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      role: user?.role ?? "customer",
      avatarBase64: user?.avatarBase64 ?? MOCK_USER.avatarBase64,
    };
    form.setFieldsValue(initial as any);

    getAvatarBase64()
      .then((b64) => {
        if (b64) setAvatarSrc(b64);
        else setAvatarSrc(MOCK_USER.avatarBase64);
      })
      .catch(() => setAvatarSrc(MOCK_USER.avatarBase64))
      .finally(() => setIsFetching(false));
  }, [loading, allowed, user, form]);

  // ✅ เลือกรูปใหม่ → preview
  const handleSelectFile = (file: File) => {
    console.log("📂 handleSelectFile รับไฟล์:", file.name, file.size, file.lastModified);
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarSrc(previewUrl); // แสดง preview ชั่วคราว
  };

  // ✅ บันทึกรูป (Base64)
  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      message.warning("กรุณาเลือกรูปก่อน");
      return;
    }
    console.log("🚀 เริ่ม convert file -> base64", selectedFile);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      console.log("📦 base64 data (preview)", base64.substring(0, 50));

      try {
        const updated = await uploadAvatarBase64(base64);
        console.log("✅ response จาก backend:", updated);

        setAvatarSrc(updated.avatarBase64); // ใช้ state ที่ถูกต้อง
        setSelectedFile(null);
        message.success("บันทึกรูปโปรไฟล์เรียบร้อย");
      } catch (e: any) {
        console.error("❌ upload error:", e);
        message.error("บันทึกรูปไม่สำเร็จ");
      }
    };

    reader.onerror = (err) => {
      console.error("❌ FileReader error:", err);
    };

    reader.readAsDataURL(selectedFile); // สำคัญมาก
  };


  // ✅ บันทึกข้อมูลทั่วไป
  const handleSaveProfile = useCallback(
    async (values: UserProfile) => {
      setSubmitting(true);
      try {
        const payload: ProfileUpdateDTO = {
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        };

        const refreshed = await updateProfile(payload);
        form.setFieldsValue(refreshed);

        message.success("บันทึกโปรไฟล์เรียบร้อย");
      } catch (e: any) {
        message.error(
          e?.response?.data?.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [form]
  );

  if (!allowed) return null;

  return (
    <div className="profile-page">
      <PageHeader />
      <div className="content-grid">
        <AvatarCard
          isLoading={isFetching}
          avatarSrc={avatarSrc || MOCK_USER.avatarBase64} // ✅ ใช้ avatarSrc
          role={form.getFieldValue("role")}
          email={form.getFieldValue("email")}
          onSelectFile={handleSelectFile}
          onSaveAvatar={handleSaveAvatar}
        />
        <ProfileForm
          form={form}
          isLoading={isFetching}
          submitting={submitting}
          onSubmit={handleSaveProfile}
        />
      </div>
    </div>
  );
}
