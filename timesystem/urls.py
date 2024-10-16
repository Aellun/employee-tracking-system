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
    check_active_break,
    LoginView,
    TaskUpdateView,
    TodayTasksView,
    ClockInStatusView,
    TodayHoursWorkedView,
    TimesheetView,
    check_active_clock_in,
    LeaveRequestViewSet,
    LeaveBalanceView,
    TaskViewSet,
    ClockInRecordViewSet,
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'timeentries', TimeEntryViewSet)
router.register(r'clockin', ClockInRecordViewSet)
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-requests')

urlpatterns = [
    # Authentication endpoints
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/obtain/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    # Router registration for user-related views
    path('api/', include(router.urls)),

    # Clock-in/Clock-out and Break endpoints
    path('api/clock-in/', clock_in, name='clock_in'), 
    path('api/clock-out/', clock_out, name='clock_out'), 
    path('api/take-break/', take_break, name='take_break'),
    path('api/end-break/', end_break, name='end_break'),
    path('api/check-active-break/', check_active_break, name='check_active_break'),

    # Task-related endpoints
    path('api/tasks/', UserTaskListView.as_view(), name='user-tasks'),
    path('api/tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'),
    path('api/tasks/today', TodayTasksView.as_view(), name='today-tasks'),

    # Timesheet and Clock-in status
    path('api/clockin-status/', ClockInStatusView.as_view(), name='clockin-status'),
    path('api/timesheet/today/', TodayHoursWorkedView.as_view(), name='today-worked-hours'),
    path('api/timesheet/', TimesheetView.as_view(), name='timesheet'),
    
    # Check active clock-in
    path('api/check-active-clockin/', check_active_clock_in, name='check-active-clockin'),

    # Leave Balance and Leave Requests
    path('api/leave-balance/', LeaveBalanceView.as_view(), name='leave-balance'),

    # Admin Dashboard URLs (included from admin_dashboard app)
    path('api/', include('admin_dashboard.urls')),

    # Django admin
    path('admin/', admin.site.urls),
    path('admin-dashboard/', include('admin_dashboard.urls')),
]
