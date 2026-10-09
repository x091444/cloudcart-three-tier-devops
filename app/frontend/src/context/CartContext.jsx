import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AuthContext } from "./AuthContext";

import {
  addCartItem,
  clearCartApi,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/api";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, accessToken } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD CART FROM BACKEND
  ========================= */

  useEffect(() => {
    async function loadCart() {
      if (!isAuthenticated || !accessToken) {
        setCartItems([]);
        return;
      }

      try {
        setLoading(true);

        const cart = await getCart(accessToken);

        setCartItems(
          cart.items.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            cartItemId: item.id,
            totalPrice: item.total_price,
          }))
        );
      } catch (error) {
        console.error("Unable to load cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [isAuthenticated, accessToken]);

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = async (product) => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    try {
      const cart = await addCartItem(
        accessToken,
        product.id,
        1
      );

      setCartItems(
        cart.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item.id,
          totalPrice: item.total_price,
        }))
      );
    } catch (error) {
      console.error("Unable to add item to cart:", error);
    }
  };

  /* =========================
     REMOVE FROM CART
  ========================= */

  const removeFromCart = async (productId) => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    if (!item) {
      return;
    }

    try {
      const cart = await removeCartItem(
        accessToken,
        item.cartItemId
      );

      setCartItems(
        cart.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item.id,
          totalPrice: item.total_price,
        }))
      );
    } catch (error) {
      console.error(
        "Unable to remove item from cart:",
        error
      );
    }
  };

  /* =========================
     UPDATE QUANTITY
  ========================= */

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    if (!item) {
      return;
    }

    try {
      const cart = await updateCartItem(
        accessToken,
        item.cartItemId,
        quantity
      );

      setCartItems(
        cart.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item.id,
          totalPrice: item.total_price,
        }))
      );
    } catch (error) {
      console.error(
        "Unable to update cart item:",
        error
      );
    }
  };

  /* =========================
     INCREASE QUANTITY
  ========================= */

  const increaseQuantity = async (productId) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    if (!item) {
      return;
    }

    await updateQuantity(
      productId,
      item.quantity + 1
    );
  };

  /* =========================
     DECREASE QUANTITY
  ========================= */

  const decreaseQuantity = async (productId) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    if (!item) {
      return;
    }

    await updateQuantity(
      productId,
      item.quantity - 1
    );
  };

  /* =========================
     CLEAR CART
  ========================= */

  const clearCart = async () => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    try {
      await clearCartApi(accessToken);

      setCartItems([]);
    } catch (error) {
      console.error("Unable to clear cart:", error);
    }
  };

  /* =========================
     CART TOTALS
  ========================= */

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  const shipping =
    subtotal === 0 || subtotal >= 1000
      ? 0
      : 79;

  const total = subtotal + shipping;

  const value = {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    total,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

