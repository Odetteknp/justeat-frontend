// import React from "react";
// import { NavLink } from "react-router-dom";
// import "./navSidebar.css";
// import MenuItem from "antd/es/menu/MenuItem";

// /* คีย์ของเมนู */
// export type NavKey = string;

// /* ข้อมูลเมนู */
// export interface NavItem {
//   key: NavKey;
//   label: React.ReactNode;
//   icon?: React.ReactNode;
//   to?: string;           // internal (react-router)
//   href?: string;         // external/anchor
//   external?: boolean;    // ถ้าอยากเปิดแท็บใหม่
//   disabled?: boolean;
//   badge?: number;        // ป้ายตัวเลขขวา (optional)
// }

// /* Props ของ Sidebar */
// export interface NavSidebarProps {
//   items: NavItem[];
//   activeKey?: NavKey;               // ใช้กับ href/button
//   onSelect?: (key: NavKey) => void; // ใช้กับ button
//   header?: React.ReactNode;
//   footer?: React.ReactNode;
//   className?: string;
// }

// const NavSidebar: React.FC<NavSidebarProps> = ({
//   items,
//   activeKey,
//   onSelect,
//   header,
//   footer,
//   className
// }) => {
//   return (
//     <aside className={`navSidebar ${className ?? ""}`} aria-label="Section navigation">
//       {/* ส่วนหัว */}
//       {header && <div className="navSidebar_Header">{header}</div>}

//       {/* รายการเมนู */}
//       <ul className="navSidebar_List">
//         {items.map((it) => {
//           const isActiveControlled = it.key === activeKey;

//           // 1) ใช้ react-router
//           if (it.to) {
//             return (
//               <li key={it.key} className="navSidebar_Item">
//                 <NavLink
//                   to={it.to}
//                   className={({ isActive }) =>
//                     `navSidebar_Btn ${isActive ? "active" : ""} ${it.disabled ? "disabled" : ""}`
//                   }
//                   aria-disabled={it.disabled || undefined}
//                   onClick={it.disabled ? (e) => e.preventDefault() : undefined}
//                 >
//                   {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
//                   <span className="navSidebar_Label">{it.label}</span>
//                   {typeof it.badge === "number" && (
//                     <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
//                   )}
//                 </NavLink>
//               </li>
//             );
//           }

//           // 2) ลิงก์ภายนอก/anchor
//           if (it.href) {
//             return (
//               <li key={it.key} className="navSidebar_Item">
//                 <a
//                   href={it.href}
//                   className={`navSidebar_Btn ${isActiveControlled ? "active" : ""} ${it.disabled ? "disabled" : ""}`}
//                   aria-current={isActiveControlled ? "page" : undefined}
//                   aria-disabled={it.disabled || undefined}
//                   target={it.external ? "_blank" : undefined}
//                   rel={it.external ? "noopener noreferrer" : undefined}
//                   onClick={it.disabled ? (e) => e.preventDefault() : undefined}
//                 >
//                   {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
//                   <span className="navSidebar_Label">{it.label}</span>
//                   {typeof it.badge === "number" && (
//                     <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
//                   )}
//                 </a>
//               </li>
//             );
//           }

//           // 3) ปุ่มธรรมดา
//           return (
//             <li key={it.key} className="navSidebar_Item">
//               <button
//                 type="button"
//                 className={`navSidebar_Btn ${isActiveControlled ? "active" : ""} ${it.disabled ? "disabled" : ""}`}
//                 onClick={it.disabled ? undefined : () => onSelect?.(it.key)}
//                 aria-current={isActiveControlled ? "page" : undefined}
//                 aria-disabled={it.disabled || undefined}
//               >
//                 {it.icon && <span className="navSidebar_Icon" aria-hidden>{it.icon}</span>}
//                 <span className="navSidebar_Label">{it.label}</span>
//                 {typeof it.badge === "number" && (
//                   <span className="navSidebar_Badge" aria-label={`${it.badge} items`}>{it.badge}</span>
//                 )}
//               </button>
//             </li>
//           );
//         })}
//       </ul>

//       {/* ส่วนท้าย */}
//       {footer && <div className="navSidebar__footer">{footer}</div>}
//     </aside>
//   );
// };

// export default NavSidebar;

import React, { type ReactNode, memo } from "react";
import { NavLink, type To } from "react-router-dom";
import "./navSidebar.css";

/** คีย์เมนู */
export type NavKey = string;

/** โครงพื้นฐานที่ทุกเมนูมี */
type BaseItem = {
  key: NavKey;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: number;
};

/** แจกแจงให้ชัด: อย่างใดอย่างหนึ่งเท่านั้น */
export type RouterItem = BaseItem & { to: To; href?: never; external?: never };
export type ExternalItem = BaseItem & {
  href: string;
  to?: never;
  external?: boolean;
};
export type ButtonItem = BaseItem & {
  to?: never;
  href?: never;
  external?: never;
};

export type NavItem = RouterItem | ExternalItem | ButtonItem;

export interface NavSidebarProps {
  items: NavItem[];
  activeKey?: NavKey;
  onSelect?: (key: NavKey) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** helper รวม class */
function cx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** type guards ให้ TS แคบชนิดได้แน่นอน */
function isRouterItem(it: NavItem): it is RouterItem {
  return "to" in it && typeof (it as any).to !== "undefined";
}
function isExternalItem(it: NavItem): it is ExternalItem {
  return "href" in it && typeof (it as any).href === "string";
}

const NavSidebar: React.FC<NavSidebarProps> = ({
  items,
  activeKey,
  onSelect,
  header,
  footer,
  className,
}) => {
  return (
    <aside
      className={cx("navSidebar", className)}
      aria-label="Section navigation"
    >
      {header && <div className="navSidebar_Header">{header}</div>}

      <ul className="navSidebar_List">
        {items.map((it) => {
          const isControlledActive = it.key === activeKey;
          const badge =
            typeof it.badge === "number" ? (
              <span
                className="navSidebar_Badge"
                aria-label={`${it.badge} items`}
              >
                {it.badge}
              </span>
            ) : null;

          // 1) Internal route
          if (isRouterItem(it)) {
            return (
              <li key={it.key} className="navSidebar_Item">
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    cx(
                      "navSidebar_Btn",
                      isActive && "active",
                      it.disabled && "disabled"
                    )
                  }
                  aria-disabled={it.disabled || undefined}
                  onClick={it.disabled ? (e) => e.preventDefault() : undefined}
                >
                  {it.icon && (
                    <span className="navSidebar_Icon" aria-hidden>
                      {it.icon}
                    </span>
                  )}
                  <span className="navSidebar_Label">{it.label}</span>
                  {badge}
                </NavLink>
              </li>
            );
          }

          // 2) External link
          if (isExternalItem(it)) {
            return (
              <li key={it.key} className="navSidebar_Item">
                <a
                  href={it.href}
                  className={cx(
                    "navSidebar_Btn",
                    isControlledActive && "active",
                    it.disabled && "disabled"
                  )}
                  aria-current={isControlledActive ? "page" : undefined}
                  aria-disabled={it.disabled || undefined}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noopener noreferrer" : undefined}
                  onClick={it.disabled ? (e) => e.preventDefault() : undefined}
                >
                  {it.icon && (
                    <span className="navSidebar_Icon" aria-hidden>
                      {it.icon}
                    </span>
                  )}
                  <span className="navSidebar_Label">{it.label}</span>
                  {badge}
                </a>
              </li>
            );
          }

          // 3) Plain button
          return (
            <li key={it.key} className="navSidebar_Item">
              <button
                type="button"
                className={cx(
                  "navSidebar_Btn",
                  isControlledActive && "active",
                  it.disabled && "disabled"
                )}
                onClick={it.disabled ? undefined : () => onSelect?.(it.key)}
                aria-current={isControlledActive ? "page" : undefined}
                aria-disabled={it.disabled || undefined}
              >
                {it.icon && (
                  <span className="navSidebar_Icon" aria-hidden>
                    {it.icon}
                  </span>
                )}
                <span className="navSidebar_Label">{it.label}</span>
                {badge}
              </button>
            </li>
          );
        })}
      </ul>

      {footer && <div className="navSidebar_Footer">{footer}</div>}
    </aside>
  );
};

export default memo(NavSidebar);
