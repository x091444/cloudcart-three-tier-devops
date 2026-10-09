from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "rating",
        "reviews",
    )

    list_filter = (
        "category",
        "badge",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = ("-created_at",)

