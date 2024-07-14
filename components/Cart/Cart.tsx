import styled from '@emotion/styled';
import { useCart, removeItemFromCart, updateItemQuantity } from '../../hooks/useCart';
import { Layout } from '../components';

const Cart = () => {
  // This will use a custom hook to fetch cart data
  const { data: cart, isLoading } = useCart();

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemFromCart(itemId);
      console.log("Item removed");
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };
  
  const handleUpdateItem = async (itemId: string, quantity: number) => {
    try {
      await updateItemQuantity(itemId, quantity);
      console.log("Item quantity updated");
    } catch (error) {
      console.error("Failed to update item quantity:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <Layout>
      <CartContainer>
        <CartTitle>Your Shopping Cart</CartTitle>
        {cart?.line_items.map((item) => (
          <CartItem key={item.id}>
            <CartItemDescription>{item.name} - ${item.price}</CartItemDescription>
            <CartItemActions>
              <Button onClick={() => handleRemoveItem(item.id)}>Remove</Button>
              <Button onClick={() => handleUpdateItem(item.id, item.quantity - 1)}>-</Button>
              <span>{item.quantity}</span>
              <Button onClick={() => handleUpdateItem(item.id, item.quantity + 1)}>+</Button>
            </CartItemActions>
          </CartItem>
        ))}
      </CartContainer>
    </Layout>
  );
};

export default Cart;
