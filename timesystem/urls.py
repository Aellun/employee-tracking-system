from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views

from .views import (
    CustomTokenObtainPairView,
    SimpleAuthView,
    LoginView,
    
    # ViewSets
    EmployeeViewSet,
    ProjectViewSet,
    TaskViewSet,
    TimeEntryViewSet,
    ClockInRecordViewSet,
    LeaveRequestViewSet,
    DepartmentViewSet,
    RoleViewSet,
    WorkHoursViewSet,
    PerformanceViewSet,

    # Functional views
    clock_in,
    clock_out,
    take_break,
    end_break,
    check_active_break,
    check_active_clock_in,

    # Task Views
    UserTaskListView,
    TaskUpdateView,
    TodayTasksView,

    # Timesheet Views
    ClockInStatusView,
    TodayHoursWorkedView,
    TimesheetView,

    # Leave
    LeaveBalanceView,

    # Admin Dashboard Views (if defined in this app; otherwise import from admin_dashboard)
    AdminDashboardStatisticsView,
    AdminDashboardChartsView,
    AdminDashboardRecentActivityView,
    AdminDashboardNotificationsView,
)

# Set up router
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'timeentries', TimeEntryViewSet)
router.register(r'clockin', ClockInRecordViewSet)
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-requests')
router.register(r'departments', DepartmentViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'workhours', WorkHoursViewSet)
router.register(r'performance', PerformanceViewSet)

# URL patterns
urlpatterns = [
    # Auth & Tokens
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/obtain/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    # Main API routes
    path('api/', include(router.urls)),

    # Clock-in/out & break
    path('api/clock-in/', clock_in, name='clock_in'),
    path('api/clock-out/', clock_out, name='clock_out'),
    path('api/take-break/', take_break, name='take_break'),
    path('api/end-break/', end_break, name='end_break'),
    path('api/check-active-break/', check_active_break, name='check_active_break'),
    path('api/check-active-clockin/', check_active_clock_in, name='check_active_clockin'),

    # Tasks
    path('api/tasks/user/', UserTaskListView.as_view(), name='user-tasks'),
    path('api/tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'),
    path('api/tasks/today/', TodayTasksView.as_view(), name='today-tasks'),

    # Timesheet
    path('api/clockin-status/', ClockInStatusView.as_view(), name='clockin-status'),
    path('api/timesheet/today/', TodayHoursWorkedView.as_view(), name='today-worked-hours'),
    path('api/timesheet/', TimesheetView.as_view(), name='timesheet'),

    # Leave
    path('api/leave-balance/', LeaveBalanceView.as_view(), name='leave-balance'),

    # Admin Dashboard (your custom admin views)
    path('api/tasks/today/', TodayTasksView.as_view(), name='today-tasks'),
    path('admin-dashboard/api/statistics/', AdminDashboardStatisticsView.as_view()),
    path('admin-dashboard/api/charts/', AdminDashboardChartsView.as_view()),
    path('admin-dashboard/api/activity/', AdminDashboardRecentActivityView.as_view()),
    path('admin-dashboard/api/notifications/', AdminDashboardNotificationsView.as_view()),

    
    # Admin dashboard routes (if more views in separate app)
    path('api/', include('admin_dashboard.urls')),
    path('admin-dashboard/', include('admin_dashboard.urls')),

    # Django Admin
    path('admin/', admin.site.urls),
]
