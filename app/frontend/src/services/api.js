const API_URL =
  import.meta.env.VITE_API_URL || "/api";


async function apiRequest(endpoint, options = {}) {
  const makeRequest = (token = null) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let accessToken =
    localStorage.getItem("cloudcart_access");

  let response = await makeRequest(accessToken);

  /*
    If the access token expired, use the refresh token
    to get a new access token and retry the request.
  */
  if (
    response.status === 401 &&
    endpoint !== "/auth/refresh/"
  ) {
    const refreshToken =
      localStorage.getItem("cloudcart_refresh");

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          `${API_URL}/auth/refresh/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh: refreshToken,
            }),
          }
        );

        const refreshData =
          await refreshResponse.json().catch(() => ({}));

        if (refreshResponse.ok && refreshData.access) {
          accessToken = refreshData.access;

          localStorage.setItem(
            "cloudcart_access",
            accessToken
          );

          window.dispatchEvent(
            new Event("cloudcart-token-refreshed")
          );

          response = await makeRequest(accessToken);
        }
      } catch (error) {
        console.error(
          "Unable to refresh access token:",
          error
        );
      }
    }
  }

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.detail ||
      data.message ||
      Object.values(data)
        .flat()
        .join(" ") ||
      `API request failed: ${response.status}`;

    throw new Error(message);
  }

  return data;
}


/* =========================
   PRODUCTS
========================= */

export async function getProducts(options = {}) {
  return apiRequest("/products/", options);
}

export async function getProduct(
  productId,
  options = {}
) {
  return apiRequest(
    `/products/${productId}/`,
    options
  );
}

export async function getCategories(options = {}) {
  return apiRequest("/categories/", options);
}


/* =========================
   AUTH
========================= */

export async function registerUser(userData) {
  return apiRequest("/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(
  username,
  password
) {
  return apiRequest("/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function refreshToken(refresh) {
  return apiRequest("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({
      refresh,
    }),
  });
}


/* =========================
   CART
========================= */

export async function getCart(accessToken) {
  return apiRequest("/cart/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function addCartItem(
  accessToken,
  productId,
  quantity = 1
) {
  return apiRequest("/cart/add/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

export async function updateCartItem(
  accessToken,
  itemId,
  quantity
) {
  return apiRequest(
    `/cart/items/${itemId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );
}

export async function removeCartItem(
  accessToken,
  itemId
) {
  return apiRequest(
    `/cart/items/${itemId}/remove/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function clearCartApi(
  accessToken
) {
  return apiRequest("/cart/clear/", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


/* =========================
   ORDERS
========================= */

export async function createOrder(
  accessToken,
  orderData
) {
  return apiRequest("/orders/create/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });
}

export async function getOrders(accessToken) {
  return apiRequest("/orders/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function cancelOrder(
  accessToken,
  orderId
) {
  return apiRequest(
    `/orders/${orderId}/cancel/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}


/* =========================
   PROFILE
========================= */

export async function getProfile(accessToken) {
  return apiRequest("/profile/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateProfile(
  accessToken,
  profileData
) {
  return apiRequest("/profile/", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(profileData),
  });
}

