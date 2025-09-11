// src/services/reviews.ts
export type Review = {
  id: number;
  rating: number;
  comments?: string;
  user?: { firstName?: string; lastName?: string } | null;
  reviewDate?: string; // ISO string
};

export type ReviewsApiResp = {
  rows: Review[];
  avg: number;   // ค่าเฉลี่ยทั้งร้าน (ไม่ตาม filter)
  total: number; // จำนวนที่ตรงกับ filter (ไว้ paginate)
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * ดึงรีวิวของร้าน
 * @param restaurantId string id จาก URL
 * @param opts limit, offset, rating (optional)
 * @param signal AbortSignal (optional)
 */
export async function fetchRestaurantReviews(
  restaurantId: string,
  opts?: { limit?: number; offset?: number; rating?: number },
  signal?: AbortSignal
): Promise<ReviewsApiResp> {
  if (!restaurantId) throw new Error("restaurantId is required");

  const q = new URLSearchParams();
  if (opts?.limit != null) q.set("limit", String(opts.limit));
  if (opts?.offset != null) q.set("offset", String(opts.offset));
  if (opts?.rating != null) q.set("rating", String(opts.rating));

  const url =
    `${API_URL}/restaurants/${restaurantId}/reviews` +
    (q.toString() ? `?${q.toString()}` : "");

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  return {
    rows: Array.isArray(data.rows) ? data.rows : [],
    avg: typeof data.avg === "number" ? data.avg : 0,
    total: typeof data.total === "number" ? data.total : 0,
  };
}
