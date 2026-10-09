from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import (
    default_token_generator,
)
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    UserProfile,
)

from .serializers import (
    CartSerializer,
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = default_token_generator.make_token(user)

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        verification_url = (
            f"{frontend_url}/verify-email/"
            f"{uid}/{token}/"
        )

        send_mail(
            subject="Verify your CloudCart account",
            message=(
                f"Hi {user.username},\n\n"
                "Welcome to CloudCart!\n\n"
                "Please verify your email address "
                "by opening the link below:\n\n"
                f"{verification_url}\n\n"
                "This verification link is required "
                "before you can log in.\n\n"
                "If you did not create this account, "
                "you can safely ignore this email.\n\n"
                "CloudCart Team"
            ),
            from_email=getattr(
                settings,
                "DEFAULT_FROM_EMAIL",
                "noreply@cloudcart.local",
            ),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": (
                    "Account created successfully. "
                    "Please check your email and verify "
                    "your account before logging in."
                ),
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        User = get_user_model()

        try:
            uid = urlsafe_base64_decode(
                uidb64
            ).decode()

            user = User.objects.get(pk=uid)

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):
            return Response(
                {
                    "detail": "Invalid verification link."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {
                    "detail": (
                        "Your email is already verified."
                    )
                },
                status=status.HTTP_200_OK,
            )

        if not default_token_generator.check_token(
            user,
            token,
        ):
            return Response(
                {
                    "detail": (
                        "This verification link is "
                        "invalid or has expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {
                "detail": (
                    "Email verified successfully. "
                    "You can now log in."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get(
            "email",
            ""
        ).strip().lower()

        if not email:
            return Response(
                {
                    "detail": "Email address is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()

        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "If an account exists with "
                        "this email, a verification "
                        "email has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        if user.is_active:
            return Response(
                {
                    "detail": (
                        "This account is already verified."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = default_token_generator.make_token(
            user
        )

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        verification_url = (
            f"{frontend_url}/verify-email/"
            f"{uid}/{token}/"
        )

        send_mail(
            subject="Verify your CloudCart account",
            message=(
                f"Hi {user.username},\n\n"
                "Please verify your CloudCart account "
                "using the link below:\n\n"
                f"{verification_url}\n\n"
                "CloudCart Team"
            ),
            from_email=getattr(
                settings,
                "DEFAULT_FROM_EMAIL",
                "noreply@cloudcart.local",
            ),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": (
                    "If the account exists and is "
                    "unverified, a verification email "
                    "has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


# =========================
# CART
# =========================


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart

    def get(self, request):
        cart = self.get_cart()

        serializer = CartSerializer(cart)

        return Response(serializer.data)


class CartAddItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response(
                {"detail": "product_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if product.stock_quantity <= 0:
            return Response(
                {"detail": "This product is out of stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item = CartItem.objects.filter(
            cart=cart,
            product=product,
        ).first()

        current_quantity = (
            cart_item.quantity
            if cart_item
            else 0
        )

        requested_quantity = (
            current_quantity + quantity
        )

        if requested_quantity > product.stock_quantity:
            return Response(
                {
                    "detail": (
                        f"Only {product.stock_quantity} "
                        f"item(s) available."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cart_item:
            cart_item.quantity = requested_quantity
            cart_item.save()
        else:
            CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
            )

        serializer = CartSerializer(cart)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class CartUpdateItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"detail": "quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > cart_item.product.stock_quantity:
            return Response(
                {
                    "detail": (
                        f"Only {cart_item.product.stock_quantity} "
                        f"item(s) available."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart_item.cart)

        return Response(serializer.data)


class CartRemoveItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart = cart_item.cart
        cart_item.delete()

        serializer = CartSerializer(cart)

        return Response(serializer.data)


class CartClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart.items.all().delete()

        serializer = CartSerializer(cart)

        return Response(serializer.data)


# =========================
# ORDERS
# =========================


class OrderCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        shipping_name = request.data.get("shipping_name")
        shipping_address = request.data.get("shipping_address")
        city = request.data.get("city")
        state = request.data.get("state")
        pincode = request.data.get("pincode")
        phone = request.data.get("phone")
        payment_method = request.data.get(
            "payment_method",
            "cod",
        )

        if not shipping_name:
            return Response(
                {"detail": "shipping_name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not shipping_address:
            return Response(
                {"detail": "shipping_address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not city:
            return Response(
                {"detail": "city is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not state:
            return Response(
                {"detail": "state is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not pincode:
            return Response(
                {"detail": "pincode is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone:
            return Response(
                {"detail": "phone is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_payment_methods = {
            "cod",
            "upi",
            "card",
        }

        if payment_method not in valid_payment_methods:
            return Response(
                {"detail": "Invalid payment method."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_items = list(
            cart.items.select_related("product").all()
        )

        if not cart_items:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =========================
        # CHECK STOCK
        # =========================

        for cart_item in cart_items:
            if cart_item.quantity > cart_item.product.stock_quantity:
                return Response(
                    {
                        "detail": (
                            f"Only "
                            f"{cart_item.product.stock_quantity} "
                            f"of '{cart_item.product.name}' "
                            f"is available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # =========================
        # CALCULATE TOTALS
        # =========================

        subtotal = sum(
            item.product.price * item.quantity
            for item in cart_items
        )

        if subtotal == 0 or subtotal >= 1000:
            shipping_amount = 0
        else:
            shipping_amount = 79

        total_amount = subtotal + shipping_amount

        # =========================
        # CREATE ORDER
        # =========================

        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            status="pending",
            payment_method=payment_method,
            shipping_name=shipping_name,
            shipping_address=shipping_address,
            city=city,
            state=state,
            pincode=pincode,
            phone=phone,
        )

        # =========================
        # CREATE ORDER ITEMS
        # =========================

        order_items = []

        for cart_item in cart_items:
            order_items.append(
                OrderItem(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price,
                )
            )

        OrderItem.objects.bulk_create(order_items)

        # =========================
        # DECREASE STOCK
        # =========================

        for cart_item in cart_items:
            product = cart_item.product

            product.stock_quantity -= cart_item.quantity
            product.save(
                update_fields=[
                    "stock_quantity",
                    "updated_at",
                ]
            )

        # =========================
        # CLEAR CART
        # =========================

        cart.items.all().delete()

        serializer = OrderSerializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class OrderListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related(
                "items__product",
                "items__product__category",
            )
        )


class OrderDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related(
                "items__product",
                "items__product__category",
            )
        )


class OrderCancelAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = (
                Order.objects
                .select_for_update()
                .prefetch_related("items__product")
                .get(
                    id=pk,
                    user=request.user,
                )
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == "cancelled":
            return Response(
                {"detail": "This order is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status in ["shipped", "delivered"]:
            return Response(
                {"detail": "This order can no longer be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status not in ["pending", "confirmed"]:
            return Response(
                {"detail": "This order cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore stock
        for item in order.items.all():
            product = Product.objects.select_for_update().get(
                id=item.product.id
            )

            product.stock_quantity += item.quantity

            product.save(
                update_fields=[
                    "stock_quantity",
                    "updated_at",
                ]
            )

        # Mark order as cancelled
        order.status = "cancelled"
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        serializer = OrderSerializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

# =========================
# USER PROFILE
# =========================


class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_profile(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile

    def get(self, request):
        profile = self.get_profile()

        serializer = UserProfileSerializer(profile)

        return Response(serializer.data)

    def put(self, request):
        profile = self.get_profile()

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

