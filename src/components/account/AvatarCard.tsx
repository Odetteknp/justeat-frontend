import { 
  Card, 
  Avatar, 
  Upload, 
  Button, 
  Skeleton
} from "antd";

import { 
  UserOutlined, 
  UploadOutlined 
} from "@ant-design/icons";

import type { UploadChangeParam } from "antd/es/upload";

type Props = {
  isLoading: boolean;
  avatarUrl?: string;
  role?: string;
  email?: string;
  onChangeAvatar: (info: UploadChangeParam) => void;
};

export default function AvatarCard({ isLoading, avatarUrl, role, email, onChangeAvatar }: Props) {
  return (
    <Card className="side-card">
      {isLoading ? (
        <div className="avatar-skeleton">
          <Skeleton.Avatar active size={96} shape="circle" />
          <Skeleton.Button active style={{ width: 160, marginTop: 12 }} />
          <Skeleton active title={false} paragraph={{ rows: 2 }} style={{ marginTop: 12 }} />
        </div>
      ) : (
        <div className="avatar-block">
          <Avatar size={96} src={avatarUrl} icon={<UserOutlined />} />
          <Upload showUploadList={false} beforeUpload={() => false} onChange={onChangeAvatar}>
            <Button className="brand-outline-btn" icon={<UploadOutlined />} style={{ marginTop: 12 }}>
              เปลี่ยนรูปโปรไฟล์
            </Button>
          </Upload>
          <div className="meta">
            {role && <div className="role-tag">{role}</div>}
            {email && <div className="muted">{email}</div>}
          </div>
        </div>
      )}
    </Card>
  );
}