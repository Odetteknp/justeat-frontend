import {
  Card,
  Avatar,
  Upload,
  Button,
  Skeleton,
  Typography,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";

type Props = {
  isLoading: boolean;
  avatarSrc?: string;        // ✅ เปลี่ยนจาก avatarUrl → avatarSrc
  role?: string;
  email?: string;
  onSelectFile: (file: File) => void;
  onSaveAvatar: () => void;
};

export default function AvatarCard({
  isLoading,
  avatarSrc,
  role,
  email,
  onSelectFile,
  onSaveAvatar,
}: Props) {
  return (
    <Card className="side-card" styles={{ body: { textAlign: "center" } }}>
      {isLoading ? (
        <div className="avatar-skeleton">
          <Skeleton.Avatar active size={96} shape="circle" />
          <Skeleton.Button active style={{ width: 160, marginTop: 12 }} />
        </div>
      ) : (
        <div className="avatar-block">
          <Avatar
            size={96}
            src={avatarSrc}   // ✅ รองรับทั้ง Base64 และ URL
            icon={<UserOutlined />}
            style={{ marginBottom: 12 }}
          />

          {/* ปุ่มเลือกรูป */}
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info: UploadChangeParam) => {
              console.log("🔥 Upload onChange:", info);

              // ✅ fallback ถ้า originFileObj ไม่มีค่า
              const rawFile = (info.file as any).originFileObj || info.file;
              if (rawFile instanceof File) {
                console.log("📂 เลือกไฟล์ส่งไป ProfilePage:", rawFile.name, rawFile.size);
                onSelectFile(rawFile);
              } else {
                console.warn("⚠️ ไม่ใช่ File object:", rawFile);
              }
            }}
            >
            <Button
              icon={<UploadOutlined />}
              style={{ marginBottom: 8 }}
              className="brand-outline-btn"
            >
              เลือกรูปใหม่
            </Button>
          </Upload>

          {/* ปุ่มบันทึกรูป */}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSaveAvatar}
            className="brand-btn"
          >
            บันทึกรูปโปรไฟล์
          </Button>

          <div className="meta" style={{ marginTop: 12 }}>
            {role && (
              <Typography.Text strong className="role-tag">
                {role}
              </Typography.Text>
            )}
            {email && (
              <Typography.Text
                type="secondary"
                className="muted"
                style={{ display: "block" }}
              >
                {email}
              </Typography.Text>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
