from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views
from .views import CustomTokenObtainPairView
from .views import SimpleAuthView
from .views import (
    EmployeeViewSet, 
    ProjectViewSet, 
    UserTaskListView, 
    TimeEntryViewSet, 
    take_break,
    end_break,
    clock_out,
    clock_in,
    check_active_break,  # New view for checking active break
    LoginView,
    TaskUpdateView,
    TodayTasksView,
    ClockInStatusView,
    TodayHoursWorkedView,
    TimesheetView,
    check_active_clock_in  
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'timeentries', TimeEntryViewSet)

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),  # Traditional login endpoint
    path('api/token/obtain/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT token obtain endpoint
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),  # JWT token refresh endpoint
    path('api/', include(router.urls)),
    path('admin_dashboard/', include('admin_dashboard.urls')),
    path('admin/', admin.site.urls),
    path('api/clock-in/', clock_in, name='clock_in'), 
    path('api/clock-out/', clock_out, name='clock_out'), 
    path('api/take-break/', take_break, name='take_break'),
    path('api/end-break/', end_break, name='end_break'),
    path('api/check-active-break/', check_active_break, name='check_active_break'),  # New endpoint for checking active break
    path('api/test-auth/', SimpleAuthView.as_view(), name='test_auth'),  # Auth test endpoint
    path('api/tasks/', UserTaskListView.as_view(), name='user-tasks'),
    path('api/tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'),
    path('api/tasks/today', TodayTasksView.as_view(), name='today-tasks'),
    path('api/clockin-status/', ClockInStatusView.as_view(), name='clockin-status'),
    path('api/timesheet/today/', TodayHoursWorkedView.as_view(), name='today-worked-hours'),
    path('api/timesheet/', TimesheetView.as_view(), name='timesheet'),
    path('api/check-active-clockin/', check_active_clock_in, name='check-active-clockin'),
]
