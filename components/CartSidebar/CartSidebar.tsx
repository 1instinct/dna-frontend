import { slide as BurgerMenu } from "react-burger-menu";
import { Loading, LoadingWrapper } from "..";
import { useCart } from "../../hooks/useCart";
import cartStyles from "./cartStyles";

import { CartWrapper, CartTitle, CartButton } from "./CartSidebar.styles";

interface Props {
  isVisible: boolean;
  toggle: () => void;
}

export const CartSidebar = ({ isVisible, toggle }: Props) => {
  const {
    data: cartData,
    isLoading: cartIsLoading,
    isError: cartHasError
  } = useCart();

  const renderCartItems = () => {
    if (Array.isArray(cartData?.data?.relationships?.variants?.data)) {
      return cartData?.data?.relationships?.variants?.data?.map(
        (item, index): any => {
          return <li key={`cart-item-${index}`}>item: {item.id} | qty: </li>;
        }
      );
    }
    return null;
  };

  if (cartIsLoading) {
    return (
      <CartWrapper>
        {/* <CartButton onClick={toggle}>
          
        </CartButton> */}
        <BurgerMenu
          right
          customBurgerIcon={<i className="btb bt-lg bt-shopping-cart" />}
          isOpen={isVisible}
          onOpen={toggle}
          styles={cartStyles()}
          onClose={toggle}
        >
          <LoadingWrapper>
            <Loading />
          </LoadingWrapper>
        </BurgerMenu>
        <style jsx>{`
          .cart-modal {
            background-color: white;
            padding: 50px;
            border: 2px grey solid;
            position: absolute;
            top: 150px;
            right: 50px;
          }
        `}</style>
      </CartWrapper>
    );
  }

  if (cartHasError) {
    return (
      <CartWrapper>
        <CartButton onClick={toggle}>
          <i className="btb bt-lg bt-shopping-cart" />
        </CartButton>
        <BurgerMenu
          right
          isOpen={isVisible}
          onOpen={toggle}
          styles={cartStyles()}
          onClose={toggle}
        >
          <CartTitle>Cart</CartTitle>
          <p>Cart Error</p>
        </BurgerMenu>
        <style jsx>{`
          .cart-modal {
            background-color: white;
            padding: 50px;
            border: 2px grey solid;
            position: absolute;
            top: 150px;
            right: 50px;
          }
        `}</style>
      </CartWrapper>
    );
  }

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_total
  } = cartData?.data?.attributes || {};

  if (cartData !== undefined) {
    return (
      <CartWrapper>
        <CartButton onClick={toggle}>
          <i className="btb bt-lg bt-shopping-cart" />
        </CartButton>
        <BurgerMenu
          right
          isOpen={isVisible}
          onOpen={toggle}
          styles={cartStyles()}
          onClose={toggle}
        >
          <CartTitle>Cart</CartTitle>
          <div>{item_count} items in your cart</div>
          <div>{renderCartItems()}</div>
          <div>Subtotal: {display_item_total}</div>
          <div>Tax: {included_tax_total}</div>
          <div>Total: {display_total}</div>
        </BurgerMenu>
        <style jsx>{`
          .cart-modal {
            background-color: white;
            padding: 50px;
            border: 2px grey solid;
            position: absolute;
            top: 150px;
            right: 50px;
          }
        `}</style>
      </CartWrapper>
    );
  }
  return null;
};
