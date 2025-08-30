import React, { useEffect, useState, useCallback } from "react";
import { Form, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
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

export default function ProfilePage() {
  const [form] = Form.useForm<UserProfile>();
  const [submitting, setSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>();

  useEffect(() => {
    const t = setTimeout(() => {
      form.setFieldsValue(MOCK_USER);
      setAvatarUrl(MOCK_USER.avatar);
      setIsFetching(false);
    }, 600);
    return () => clearTimeout(t);
  }, [form]);

  const handleAvatarChange = useCallback((info: UploadChangeParam) => {
    const file = info.file.originFileObj;
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);
    message.success("เปลี่ยนรูปโปรไฟล์เรียบร้อย ✅");
  }, []);

  const handleSave = useCallback(async (values: UserProfile) => {
    setSubmitting(true);
    try {
      // TODO: PUT /me (รวม avatarUrl)
      console.log("payload:", { ...values, avatar: avatarUrl });
      message.success("บันทึกโปรไฟล์เรียบร้อย ✅");
    } catch {
      message.error("บันทึกไม่สำเร็จ ❌ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }, [avatarUrl]);

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