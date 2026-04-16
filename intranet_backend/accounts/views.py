from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from accounts.serializers import RegisterSerializer, UserSerializer

User = get_user_model()


@extend_schema(
    tags=["Auth"],
    description="**Access:** Admin only.\n\nCreate a new user with a specific role.",
)
class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Admin-only user creation."""

    serializer_class = RegisterSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Auth"],
    description="**Access:** Any authenticated user (own profile only).\n\nRetrieve or update the currently authenticated user's profile.",
)
class ProfileView(generics.RetrieveUpdateAPIView):
    """GET / PUT /api/auth/profile/ — own profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(
    tags=["Auth"],
    description="**Access:** Admin only.\n\nList all registered users.",
)
class UserListView(generics.ListAPIView):
    """GET /api/auth/users/ — Admin-only user list."""

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
