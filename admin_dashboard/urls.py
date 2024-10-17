from django.urls import path
from . import views
from .views import AdminStatisticsView, LeaveRequestListView, LeaveRequestDetailView, EmployeeListView, EmployeeDetailView, TaskDetailView, TaskListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Employee URLs
    path('api/employees/', views.UserListView.as_view(), name='user-list'),
    path('api/employees/<int:employee_id>/', EmployeeDetailView.as_view(), name='employee-detail'),

    # Task URLs
    path('api/tasks/<int:id>/', TaskDetailView.as_view(), name='task-detail'),

    path('api/tasks/', TaskListView.as_view(), name='task-list'),

    # Project URLs
    path('api/projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),

    # Time Entry URLs
    path('api/time-entries/', views.TimeEntryListCreateView.as_view(), name='timeentry-list-create'),

    # Statistics URLs
    path('api/statistics/employees/', views.employee_statistics, name='employee-statistics'),
    path('api/statistics/projects/', views.project_overview, name='project-overview'),
    path('api/statistics/tasks/', views.task_statistics, name='task-statistics'),
    path('api/statistics/time-entries/', views.time_entry_statistics, name='time-entry-statistics'),
    path('api/statistics/clockins/', views.clockin_statistics, name='clockin-statistics'),
    path('api/statistics/leave-requests/', views.leave_request_statistics, name='leave-request-statistics'),
    path('api/statistics/leave-balances/', views.leave_balance_statistics, name='leave-balance-statistics'),
    path('api/statistics/admin/', AdminStatisticsView.as_view(), name='admin-statistics'),

    # Leave URLs
    path('api/leaves/', LeaveRequestListView.as_view(), name='leave-request-list'),
    path('api/leaves/<int:leave_id>/', LeaveRequestDetailView.as_view(), name='leave-request-detail'),

    # JWT Token URLs
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
