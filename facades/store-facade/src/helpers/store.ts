import { Order } from "../models";
import { Product } from "../models/product.model";

export async function collectProductIds(orders: any): Promise<number[]> {
  const productIds: number[] = [];
  for (const order of orders) {
    for (const item of order.orderItems) {
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
  const productMap = new Map(products.map(product => [product.id, product]));
  const mergedOrders: any[] = orders.map(order => {
    const mergedItems: any[] = (order as Order).orderItems.map(item => {
      const product = productMap.get(item.productId);
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