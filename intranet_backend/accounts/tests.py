from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTokenTests(APITestCase):
    """Tests for JWT login and refresh."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="employee1",
            password="TestPass123!",
            role=User.Role.EMPLOYEE,
        )
        self.login_url = reverse("token_obtain_pair")
        self.refresh_url = reverse("token_refresh")

    def test_login_returns_tokens(self):
        response = self.client.post(
            self.login_url,
            {"username": "employee1", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_credentials(self):
        response = self.client.post(
            self.login_url,
            {"username": "employee1", "password": "WrongPass"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        login = self.client.post(
            self.login_url,
            {"username": "employee1", "password": "TestPass123!"},
            format="json",
        )
        refresh = login.data["refresh"]
        response = self.client.post(
            self.refresh_url,
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class RegisterTests(APITestCase):
    """Tests for user registration (Admin-only)."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="AdminPass123!",
            role=User.Role.ADMIN,
        )
        self.employee = User.objects.create_user(
            username="emp1",
            password="EmpPass123!",
            role=User.Role.EMPLOYEE,
        )
        self.register_url = reverse("register")

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_admin_can_register_user(self):
        self._auth(self.admin)
        data = {
            "username": "newuser",
            "password": "NewUser123!",
            "email": "new@example.com",
            "role": "manager",
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role"], "manager")
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_employee_cannot_register_user(self):
        self._auth(self.employee)
        data = {
            "username": "hacker",
            "password": "HackPass123!",
            "role": "admin",
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_register(self):
        data = {"username": "anon", "password": "AnonPass123!"}
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_username_fails(self):
        self._auth(self.admin)
        data = {"username": "admin1", "password": "SomePass123!"}
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileTests(APITestCase):
    """Tests for profile endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="profuser",
            password="ProfPass123!",
            email="prof@example.com",
            role=User.Role.MANAGER,
        )
        self.profile_url = reverse("profile")

    def test_authenticated_user_gets_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profuser")
        self.assertEqual(response.data["role"], "manager")

    def test_anonymous_cannot_access_profile(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserListTests(APITestCase):
    """Tests for user list endpoint (Admin-only)."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin2",
            password="AdminPass123!",
            role=User.Role.ADMIN,
        )
        self.employee = User.objects.create_user(
            username="emp2",
            password="EmpPass123!",
            role=User.Role.EMPLOYEE,
        )
        self.users_url = reverse("user-list")

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_employee_cannot_list_users(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class UserModelTests(APITestCase):
    """Tests for User model."""

    def test_str_representation(self):
        user = User.objects.create_user(
            username="testuser", password="TestPass123!", role=User.Role.ADMIN
        )
        self.assertEqual(str(user), "testuser (Admin)")

    def test_role_helper_properties(self):
        admin = User.objects.create_user(
            username="a", password="Pass1234!", role=User.Role.ADMIN
        )
        mgr = User.objects.create_user(
            username="m", password="Pass1234!", role=User.Role.MANAGER
        )
        emp = User.objects.create_user(
            username="e", password="Pass1234!", role=User.Role.EMPLOYEE
        )
        self.assertTrue(admin.is_admin)
        self.assertFalse(admin.is_manager)
        self.assertTrue(mgr.is_manager)
        self.assertTrue(emp.is_employee)

    def test_default_role_is_employee(self):
        user = User.objects.create_user(username="def", password="Pass1234!")
        self.assertEqual(user.role, User.Role.EMPLOYEE)
