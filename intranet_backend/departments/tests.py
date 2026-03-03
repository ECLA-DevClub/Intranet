from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from departments.models import Department


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
    """Tests for Department REST API endpoints."""

    def setUp(self):
        self.department = Department.objects.create(
            name="Engineering",
            description="Software engineering department.",
        )
        self.list_url = reverse("department-list")
        self.detail_url = reverse("department-detail", args=[self.department.pk])

    # ── List ──────────────────────────────────────────────
    def test_list_departments(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # ── Create ────────────────────────────────────────────
    def test_create_department(self):
        data = {"name": "HR", "description": "Human resources."}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Department.objects.count(), 2)
        self.assertEqual(response.data["name"], "HR")

    def test_create_duplicate_name_fails(self):
        data = {"name": "Engineering"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_name_fails(self):
        data = {"description": "No name provided."}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Retrieve ──────────────────────────────────────────
    def test_retrieve_department(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Engineering")

    # ── Update (PUT) ──────────────────────────────────────
    def test_update_department(self):
        data = {"name": "Eng", "description": "Updated."}
        response = self.client.put(self.detail_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.department.refresh_from_db()
        self.assertEqual(self.department.name, "Eng")
        self.assertEqual(self.department.description, "Updated.")

    # ── Partial Update (PATCH) ────────────────────────────
    def test_partial_update_department(self):
        data = {"description": "Patched description."}
        response = self.client.patch(self.detail_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.department.refresh_from_db()
        self.assertEqual(self.department.description, "Patched description.")

    # ── Delete ────────────────────────────────────────────
    def test_delete_department(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Department.objects.count(), 0)

    # ── Search ────────────────────────────────────────────
    def test_search_by_name(self):
        Department.objects.create(name="Marketing")
        response = self.client.get(self.list_url, {"search": "market"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Marketing")
