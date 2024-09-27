from django.urls import path
from .views import EmployeeListCreateView, ProjectListCreateView, TimeEntryListCreateView

urlpatterns = [
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('time-entries/', TimeEntryListCreateView.as_view(), name='timeentry-list-create'),
]
