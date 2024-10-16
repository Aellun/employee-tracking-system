from django.contrib import admin
from .models import Employee, Project, Task, TimeEntry, LeaveRequest, ClockInRecord, LeaveBalance

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'role', 'is_active']  # Updated 'position' to 'role'
    search_fields = ['first_name', 'last_name', 'email', 'role']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'start_date', 'end_date']
    search_fields = ['name', 'description']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'due_date', 'assigned_to']
    search_fields = ['name', 'status']

@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'project', 'start_time', 'end_time']  # Removed 'task' and 'is_billable'
    search_fields = ['employee__first_name', 'employee__last_name', 'project__name']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee_name', 'leave_type', 'start_date', 'end_date', 'status']
    search_fields = ['employee_name', 'leave_type']

@admin.register(ClockInRecord)
class ClockInRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'time_clocked_in', 'time_clocked_out', 'hours_worked']
    search_fields = ['user__username']

@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'annual', 'sick', 'casual', 'maternity']
    search_fields = ['user__username']
