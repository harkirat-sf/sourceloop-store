import { Order } from "../models";
import { Product } from "../models/product.model";

export async function collectProductIds(orders: any): Promise<number[]> {
  const productIds: number[] = [];

  if (!Array.isArray(orders)) {
    // optional: throw error or return empty
    return productIds;
  }

  for (const order of orders) {
    const items = Array.isArray(order?.orderItems) ? order.orderItems : [];
    for (const item of items) {
      if (item?.productId != null) {
        productIds.push(item.productId);
      }
    }
  }

  return productIds;
}

export async function mergeItemProducts(
  orders: Array<Order>,
  products: Array<Product>
): Promise<any[]> {
  const productMap = new Map(products?.map(product => [product?.id, product]));
  const mergedOrders: any[] = orders?.map(order => {
    const mergedItems: any[] = (order as Order)?.orderItems?.map(item => {
      const product = productMap.get(item?.productId);
      return {
        ...item,
        product: product || null,
      };
    });
    return {
      ...order,
      orderItems: mergedItems,
    };
  });
  return mergedOrders;
}