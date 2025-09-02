import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/auth";
import { getToken, clearToken } from "../services/tokenStore"; // ⬅️ เพิ่ม clearToken

// ปรับให้ตรง type ผู้ใช้ของคุณถ้าจำเป็น
type User = { id: string | number; email?: string; role?: string; [k: string]: any };

type GuardOptions = {
  /** ถ้า true (ค่าเริ่มต้น) จะเด้งหน้าให้อัตโนมัติเมื่อไม่ผ่าน */
  autoRedirect?: boolean;
  /** หน่วงเวลาก่อนเด้ง (มิลลิวินาที) — ใส่ 0 เพื่อเด้งทันที */
  redirectDelayMs?: number;
  /** กำหนดปลายทางสำหรับ 401/403 */
  redirectTo?: {
    unauthorized?: string; // ไม่มี token / หมดอายุ
    forbidden?: string;    // role ไม่ตรง
  };
  /** callback หลังจาก logout (เช่น ล้าง cache อื่น ๆ) */
  onLogout?: () => void;
};

export function useAuthGuard(allowedRoles: string[] = [], opts: GuardOptions = {}) {
  const {
    autoRedirect = true,
    redirectDelayMs = 10000,
    redirectTo = { unauthorized: "/login", forbidden: "/" },
    onLogout,
  } = opts;

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  // ให้ effect re-run เมื่อชุด role ที่อนุญาตเปลี่ยน
  const rolesKey = useMemo(() => allowedRoles.slice().sort().join("|"), [allowedRoles]);

  // เก็บ timer id ไว้เคลียร์ตอน unmount/ก่อน redirect ใหม่
  const timersRef = useRef<number[]>([]);
  const scheduleNav = (to: string, state?: any) => {
    if (!autoRedirect) return;
    const id = window.setTimeout(() => {
      navigate(to, { replace: true, state });
    }, redirectDelayMs);
    timersRef.current.push(id);
  };

  // 👇 เพิ่ม: ฟังก์ชัน LOGOUT แบบ A (frontend-only)
  const logout = (to?: string) => {
    // 1) ปิด timer เด้งหน้าเก่าที่ค้างอยู่
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];

    // 2) ลบ token ออกจาก storage
    try { clearToken?.(); } catch {}

    // 3) เคลียร์สถานะใน hook
    setUser(null);
    setStatus(401);

    // 4) callback เสริม (ถ้ามี) เช่น reset query cache
    try { onLogout?.(); } catch {}

    // 5) เด้งหน้า (ค่าเริ่มต้นไปหน้า unauthorized)
    const target = to ?? redirectTo.unauthorized ?? "/login";
    if (autoRedirect) {
      if (redirectDelayMs === 0) {
        navigate(target, { replace: true });
      } else {
        scheduleNav(target);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = getToken?.();

      // 1) ไม่มี token → 401
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setStatus(401);
          setLoading(false);
        }
        scheduleNav(redirectTo.unauthorized || "/login", { from: location.pathname });
        return;
      }

      // 2) มี token → ไปดึง /me
      try {
        const res = await auth.me();
        const me = (res as any)?.data?.data ?? (res as any)?.data ?? res ?? null;

        if (cancelled) return;

        setUser(me);

        // ตรวจ role ถ้าระบุ allowedRoles
        if (allowedRoles.length > 0) {
          const role = String(me?.role ?? "").toLowerCase();
          const ok = allowedRoles.map(r => r.toLowerCase()).includes(role);
          if (!ok) {
            setStatus(403);
            setLoading(false);
            scheduleNav(redirectTo.forbidden || "/");
            return;
          }
        }

        setStatus(200);
      } catch (e: any) {
        if (cancelled) return;
        setUser(null);
        setStatus(e?.response?.status ?? 0); // network = 0
        setLoading(false);
        scheduleNav(redirectTo.unauthorized || "/login", { from: location.pathname });
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesKey, navigate, location.pathname, autoRedirect, redirectDelayMs, redirectTo.unauthorized, redirectTo.forbidden]);

  const allowed =
    !!user &&
    (allowedRoles.length === 0 ||
      allowedRoles.map(r => r.toLowerCase()).includes(String(user.role ?? "").toLowerCase()));

  // ✅ คืน logout ออกไปใช้ในปุ่ม/เมนูได้เลย
  return { loading, allowed, user, status, logout };
}
