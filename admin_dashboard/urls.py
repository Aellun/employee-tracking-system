from django.urls import path
from . import views
from .views import (
    AdminStatisticsView, LeaveRequestListView, LeaveRequestDetailView, 
    EmployeeListView, EmployeeDetailView, TaskDetailView, TaskListView,
    LeaveBalanceReportView, LeaveRequestReportView, WorkHoursReportView, 
    ProjectTaskReportView, BillableHoursReportView, PerformanceMetricsReportView,
    PerformanceListCreateView, PerformanceDetailView, WorkHoursListCreateView,
    WorkHoursDetailView,ProjectListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Employee URLs
    path('api/employees/', views.UserListView.as_view(), name='user-list'),
    path('api/employees/data/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('api/employees/data/', EmployeeListView.as_view(), name='employee-list'),

    # Task URLs
    path('api/tasks/', TaskListView.as_view(), name='task-list'),  # URL for listing and creating tasks
    path('api/tasks/<int:id>/', TaskDetailView.as_view(), name='task-detail'),  # URL for retrieving, updating, and deleting a specific task
    path('api/projects/', ProjectListView.as_view(), name='project-list'),  # URL for listing projects
    
    # Project URLs
    path('api/projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
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
    # clockins URLs
    path('api/clockins/', views.clockin_list, name='clockin-list'),
    path('api/clockins/<int:pk>/', views.clockin_detail, name='clockin-detail'),
    
    # report paths
    path('api/reports/leave-balance/', LeaveBalanceReportView.as_view(), name='leave-balance-report'),
    path('api/reports/leave-requests/', LeaveRequestReportView.as_view(), name='leave-requests-report'),
    path('api/reports/work-hours/', WorkHoursReportView.as_view(), name='work-hours-report'),
    path('api/reports/tasks/', ProjectTaskReportView.as_view(), name='tasks-report'),
    path('api/reports/billable-hours/', BillableHoursReportView.as_view(), name='billable-hours-report'),
    path('api/reports/performance-metrics/', PerformanceMetricsReportView.as_view(), name='performance-metrics-report'),
    path('api/aggregated-reports/', views.aggregated_reports, name='aggregated_reports'),
    path('api/performance/', PerformanceListCreateView.as_view(), name='performance-list-create'),
    path('api/performance/<int:pk>/', PerformanceDetailView.as_view(), name='performance-detail'),
    path('api/workhours/', WorkHoursListCreateView.as_view(), name='workhours-list-create'),
    path('api/workhours/<int:pk>/', WorkHoursDetailView.as_view(), name='workhours-detail'),

]
