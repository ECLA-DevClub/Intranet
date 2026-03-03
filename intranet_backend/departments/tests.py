from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from departments.models import Department

User = get_user_model()


class DepartmentModelTests(APITestCase):
    """Tests for the Department model itself."""

    def test_str_returns_name(self):
        department = Department.objects.create(name="Engineering")
        self.assertEqual(str(department), "Engineering")

    def test_default_ordering_by_name(self):
        Department.objects.create(name="Zebra")
        Department.objects.create(name="Alpha")
        names = list(Department.objects.values_list("name", flat=True))
        self.assertEqual(names, ["Alpha", "Zebra"])


class DepartmentAPITests(APITestCase):
    """Tests for Department REST API with role-based access."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="AdminPass123!", role=User.Role.ADMIN,
        )
        self.manager = User.objects.create_user(
            username="manager", password="MgrPass123!", role=User.Role.MANAGER,
        )
        self.employee = User.objects.create_user(
            username="employee", password="EmpPass123!", role=User.Role.EMPLOYEE,
        )
        self.department = Department.objects.create(
            name="Engineering",
            description="Software engineering department.",
        )
        self.list_url = reverse("department-list")
        self.detail_url = reverse("department-detail", args=[self.department.pk])

    # ── Anonymous access ──────────────────────────────────
    def test_anonymous_cannot_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Employee (read-only) ──────────────────────────────
    def test_employee_can_list(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_employee_can_retrieve(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_employee_cannot_create(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(
            self.list_url, {"name": "HR"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_update(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.put(
            self.detail_url,
            {"name": "Eng", "description": "X"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_delete(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Manager (read + write) ────────────────────────────
    def test_manager_can_create(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(
            self.list_url, {"name": "Marketing"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_manager_can_update(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.patch(
            self.detail_url, {"description": "Updated"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manager_can_delete(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # ── Admin (full access) ───────────────────────────────
    def test_admin_can_create(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.list_url, {"name": "Finance"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_can_delete(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # ── Validation ────────────────────────────────────────
    def test_duplicate_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.list_url, {"name": "Engineering"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Search ────────────────────────────────────────────
    def test_search_by_name(self):
        self.client.force_authenticate(user=self.employee)
        Department.objects.create(name="Marketing")
        response = self.client.get(self.list_url, {"search": "market"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Marketing")
