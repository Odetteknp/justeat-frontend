import React from "react";
import { NavLink } from "react-router-dom";
import "./navSidebar.css";
import MenuItem from "antd/es/menu/MenuItem";

/* คีย์ของเมนู */
export type NavKey = string;

/* ข้อมูลเมนู */
export interface NavItem {
  key: NavKey;
  label: React.ReactNode;
  icon?: React.ReactNode;
  to?: string;           // internal (react-router)
  href?: string;         // external/anchor
  external?: boolean;    // ถ้าอยากเปิดแท็บใหม่
  disabled?: boolean;
  badge?: number;        // ป้ายตัวเลขขวา (optional)
}

/* Props ของ Sidebar */
export interface NavSidebarProps {
  items: NavItem[];
  activeKey?: NavKey;               // ใช้กับ href/button
  onSelect?: (key: NavKey) => void; // ใช้กับ button
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const NavSidebar: React.FC<NavSidebarProps> = ({
  items,
  activeKey,
  onSelect,
  header,
  footer,
  className
}) => {
  return (
    <aside className={`navSidebar ${className ?? ""}`} aria-label="Section navigation">
      {/* ส่วนหัว */}
      {header && <div className="navSidebar_Header">{header}</div>}

      {/* รายการเมนู */}
      <ul className="navSidebar_List">
        {items.map((it) => {
          const isActiveControlled = it.key === activeKey;

          // 1) ใช้ react-router
          if (it.to) {
            return (
              <li key={it.key} className="navSidebar_Item">
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `navSidebar_Btn ${isActive ? "active" : ""} ${it.disabled ? "disabled" : ""}`
                  }
                  aria-disabled={it.disabled || undefined}
                  onClick={it.disabled ? (e) => e.preventDefault() : undefined}
                >
                  {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
                  <span className="navSidebar_Label">{it.label}</span>
                  {typeof it.badge === "number" && (
                    <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
                  )}
                </NavLink>
              </li>
            );
          }

          // 2) ลิงก์ภายนอก/anchor
          if (it.href) {
            return (
              <li key={it.key} className="navSidebar_Item">
                <a
                  href={it.href}
                  className={`navSidebar_Btn ${isActiveControlled ? "active" : ""} ${it.disabled ? "disabled" : ""}`}
                  aria-current={isActiveControlled ? "page" : undefined}
                  aria-disabled={it.disabled || undefined}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noopener noreferrer" : undefined}
                  onClick={it.disabled ? (e) => e.preventDefault() : undefined}
                >
                  {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
                  <span className="navSidebar_Label">{it.label}</span>
                  {typeof it.badge === "number" && (
                    <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
                  )}
                </a>
              </li>
            );
          }

          // 3) ปุ่มธรรมดา
          return (
            <li key={it.key} className="navSidebar_Item">
              <button
                type="button"
                className={`navSidebar_Btn ${isActiveControlled ? "active" : ""} ${it.disabled ? "disabled" : ""}`}
                onClick={it.disabled ? undefined : () => onSelect?.(it.key)}
                aria-current={isActiveControlled ? "page" : undefined}
                aria-disabled={it.disabled || undefined}
              >
                {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
                <span className="navSidebar_Label">{it.label}</span>
                {typeof it.badge === "number" && (
                  <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* ส่วนท้าย */}
      {footer && <div className="navSidebar__footer">{footer}</div>}
    </aside>
  );
};

export default NavSidebar;
