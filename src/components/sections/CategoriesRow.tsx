import { Avatar, Typography, Flex, ConfigProvider } from "antd";

type Category = { id: string; name: string; icon: string; href: string };

export default function CategoriesRowAntd({
  title = "หมวดหมู่",
  items,
  size = 64,
  gap = 28,
  scroll = false
}: {
  title?: string;
  items: Category[];
  size?: number;
  gap?: number;
  scroll?: boolean;
}) {
  return (
    <section>
      <Typography.Text strong style={{ display: "block", margin: "10px 0 12px" }}>
        {title}
      </Typography.Text>

      <ConfigProvider>
        <div
          style={
            scroll
              ? { display: "grid", gridAutoFlow: "column", gap, overflowX: "auto", paddingBottom: 8 }
              : { display: "flex", flexWrap: "wrap", gap, alignItems: "center" }
          }
        >
          {items.map((c) => (
            <a
              key={c.id}
              href={c.href}
              aria-label={c.name}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Flex vertical align="center" gap={8}>
                <div
                  style={{
                    borderRadius: "50%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    border: "2px solid #fff",
                    transition: "transform .12s ease",
                    width: size,
                    height: size,
                    overflow: "hidden"
                  }}
                  className="cat-thumb"
                >
                  <Avatar src={c.icon} size={size} shape="circle" alt={c.name} />
                </div>

                <Typography.Text style={{ fontSize: 12, color: "#595959", textAlign: "center", maxWidth: size + 40 }}>
                  {c.name}
                </Typography.Text>
              </Flex>
            </a>
          ))}
        </div>
      </ConfigProvider>

      <style>{`.cat-thumb:hover{ transform: scale(1.05); }`}</style>
    </section>
  );
}
