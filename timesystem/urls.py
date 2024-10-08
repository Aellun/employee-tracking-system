from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import(
    EmployeeViewSet, 
    ProjectViewSet, 
    TaskViewSet, 
    TimeEntryViewSet, 
    take_break,
    clock_out,
    clock_in,
    LoginView
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'timeentries', TimeEntryViewSet)

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),
    path('admin_dashboard/', include('admin_dashboard.urls')),
    path("admin/", admin.site.urls),
    path('api/clock-in/', clock_in, name='clock_in'), 
    path('api/clock-out/', clock_out, name='clock_out'), 
    path('api/take-break/', take_break, name='take_break'),
]
