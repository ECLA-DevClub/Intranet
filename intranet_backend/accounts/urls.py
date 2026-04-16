from django.urls import path
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.serializers import CustomTokenObtainPairSerializer
from accounts.views import ProfileView, RegisterView, UserListView


@extend_schema(
    tags=["Auth"],
    description="**Access:** Public (no authentication required).\n\nObtain JWT access and refresh tokens by providing username and password.",
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(
    tags=["Auth"],
    description="**Access:** Public (no authentication required).\n\nRefresh an expired access token using a valid refresh token.",
)
class CustomTokenRefreshView(TokenRefreshView):
    pass


urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("users/", UserListView.as_view(), name="user-list"),
]
