from rest_framework.routers import DefaultRouter

from departments.views import DepartmentViewSet

router = DefaultRouter()
router.register("", DepartmentViewSet, basename="department")

urlpatterns = router.urls
