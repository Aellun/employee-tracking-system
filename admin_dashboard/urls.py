from django.urls import path
from . import views
from .views import AdminStatisticsView

urlpatterns = [
    path('api/employees/', views.EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('api/projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('api/time-entries/', views.TimeEntryListCreateView.as_view(), name='timeentry-list-create'),
    path('api/statistics/employees/', views.employee_statistics, name='employee-statistics'),
    path('api/statistics/projects/', views.project_overview, name='project-overview'),
    path('api/statistics/tasks/', views.task_statistics, name='task-statistics'),
    path('api/statistics/time-entries/', views.time_entry_statistics, name='time-entry-statistics'),
    path('api/statistics/clockins/', views.clockin_statistics, name='clockin-statistics'),
    path('api/statistics/leave-requests/', views.leave_request_statistics, name='leave-request-statistics'),
    path('api/statistics/leave-balances/', views.leave_balance_statistics, name='leave-balance-statistics'),
    path('api/statistics/admin/', AdminStatisticsView.as_view(), name='admin-statistics'),
]
