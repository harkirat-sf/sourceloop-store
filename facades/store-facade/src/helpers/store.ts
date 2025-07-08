import { OrderDto, ProductDto } from "packages-interfaces";
import { EntitesDto, OrderItemProductDto } from "../controllers";

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
  orders: Array<OrderDto>,
  products: Array<ProductDto>
): Promise<EntitesDto[]> {
  const productMap = new Map(products.map(product => [product.id, product]));
  const mergedOrders: EntitesDto[] = orders.map(order => {
    const mergedItems: OrderItemProductDto[] = (order as EntitesDto).orderItems.map(item => {
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