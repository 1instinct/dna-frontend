import * as BurgerMenu from "react-burger-menu";
const Menu = (BurgerMenu.slide as unknown) as React.ComponentType<any>;
import { useRouter } from "next/router";
import { Loading, LoadingWrapper } from "..";
import {
  useCart,
  removeItemFromCart,
  updateItemQuantity
} from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import cartStyles from "./cartStyles";

import {
  CartWrapper,
  CartTitle,
  CartButton,
  CartItem,
  CartItemDescription,
  QuantityAdjusterWrapper,
  QuantitySelector,
  QuantityAdjuster,
  TotalLine,
  EmptyCartMessage,
  Actions
} from "./CartSidebar.styles";
import {
  IProduct,
  IProducts
} from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { Button } from "../shared";

interface Props {
  isVisible: boolean;
  toggle: () => void;
}

export const CartSidebar = ({ isVisible, toggle }: Props) => {
  const router = useRouter();
  const {
    data: cartData,
    isLoading: cartIsLoading,
    isError: cartHasError
  } = useCart();

  const { data: productsData } = useProducts(1);

  const foundProduct = (productId: string, productsData: IProducts) => {
    // Check if productsData and productsData.data exist and are iterable
    if (!productsData || !Array.isArray(productsData.data)) {
      console.error("Invalid or missing productsData");
      return null;
    }

    for (const product of productsData.data) {
      // Also check if the relationships and variants exist and are iterable
      if (
        product.relationships &&
        product.relationships.variants &&
        Array.isArray(product.relationships.variants.data)
      ) {
        const variant = product.relationships.variants.data.find(
          (variant) => variant.id === productId
        );
        if (variant) {
          return product;
        }
      }
    }

    return null;
  };

  const handleUpdateItemQuantity = async (
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      await removeItemFromCart(itemId);
    } else {
      await updateItemQuantity(itemId, newQuantity);
    }
  };

  const renderCartItems = () => {
    if (Array.isArray(cartData?.data?.relationships?.variants?.data)) {
      return cartData?.data?.relationships?.variants?.data?.map(
        (item, index): any => {
          if (!productsData || !Array.isArray(productsData.data)) {
            console.error("Invalid or missing productsData");
            return null;
          }
          const itemCount = cartData?.data?.attributes?.item_count;
          const product = foundProduct(item.id, productsData);

          return (
            <CartItem key={`cart-item-${index}`}>
              <CartItemDescription>
                {product?.attributes?.name} - ${product?.attributes?.price}
              </CartItemDescription>
              <QuantityAdjusterWrapper>
                <QuantityAdjuster
                  onClick={() =>
                    handleUpdateItemQuantity(item.id, itemCount - 1)
                  }
                >
                  -
                </QuantityAdjuster>
                <QuantitySelector
                  value={itemCount}
                  onChange={() => {
                    console.log("onChange");
                  }}
                />
                <QuantityAdjuster
                  onClick={() =>
                    handleUpdateItemQuantity(item.id, itemCount + 1)
                  }
                >
                  +
                </QuantityAdjuster>
              </QuantityAdjusterWrapper>
            </CartItem>
          );
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
        <Menu
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
        </Menu>
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
        <Menu
          right
          isOpen={isVisible}
          onOpen={toggle}
          styles={cartStyles()}
          onClose={toggle}
        >
          <CartTitle>Cart</CartTitle>
          <p>Cart Error</p>
        </Menu>
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
        <Menu
          right
          isOpen={isVisible}
          onOpen={toggle}
          styles={cartStyles()}
          onClose={toggle}
          width={360}
        >
          <CartTitle>Cart</CartTitle>
          <div>
            {item_count} {item_count > 1 ? "items" : "item"} in your cart
          </div>
          <div>{renderCartItems()}</div>
          <TotalLine>Subtotal: {display_item_total}</TotalLine>
          <TotalLine>Tax: {included_tax_total}</TotalLine>
          <TotalLine>Total: {display_total}</TotalLine>
          <Actions>
            <Button variant="outline" onClick={() => router.push("/cart")}>
              View Cart
            </Button>
            <Button onClick={() => router.push("/checkout")}>Checkout</Button>
          </Actions>
        </Menu>
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
