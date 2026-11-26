import { Cart } from "../components/Cart";
import { Layout } from "../components/Layout";

// Layout supplies the page's <main> landmark and footer, as on every other page.
const CartPage = () => (
  <Layout>
    <Cart />
  </Layout>
);

export default CartPage;
