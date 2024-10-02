
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, ProjectViewSet, TaskViewSet, TimeEntryViewSet,clock_out

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'timeentries', TimeEntryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin_dashboard/', include('admin_dashboard.urls')),
    path("admin/", admin.site.urls),
    path('api/clockout/', clock_out, name='clockout'),
]

