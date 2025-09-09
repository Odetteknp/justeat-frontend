export interface OrderSummary {
  id: number;
  restaurantId: number;
  total: number;
  orderStatusId: number;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  orderStatusId: number;
  restaurantId: number;
  items: Array<{
    id: number;
    menuId: number;
    qty: number;
    unitPrice: number;
    total: number;
    note?: string;
  }>;
}
