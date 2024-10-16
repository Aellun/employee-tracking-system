from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # Employee Management
    path('employees/', views.EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/list/', views.list_users, name='employee-list'),
    path('employees/delete/<int:user_id>/', views.delete_user, name='delete-user'),

    # Project Management
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/overview/', views.project_overview, name='project-overview'),

    # Task Management
    path('tasks/statistics/', views.task_statistics, name='task-statistics'),

    # Time Entry Management
    path('time-entries/', views.TimeEntryListCreateView.as_view(), name='time-entry-list-create'),
    path('time-entries/statistics/', views.time_entry_statistics, name='time-entry-statistics'),

    # Clock-In Management
    path('clockins/statistics/', views.clockin_statistics, name='clockin-statistics'),

    # Leave Request Management
    path('leaves/statistics/', views.leave_request_statistics, name='leave-request-statistics'),

    # Leave Balance Management
    path('leave-balances/statistics/', views.leave_balance_statistics, name='leave-balance-statistics'),

    # Admin Dashboard Statistics
    path('admin/statistics/', views.admin_statistics, name='admin-statistics'),
    
    # Employee Statistics
    
    path('statistics/employees/', views.employee_statistics, name='employee-statistics'),

     path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
]
