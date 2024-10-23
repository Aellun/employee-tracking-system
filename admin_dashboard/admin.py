from django.contrib import admin
from timesystem.models import Employee, Project, Task, TimeEntry, LeaveRequest, ClockInRecord, LeaveBalance, Performance, WorkHours
admin.site.register(Performance)
admin.site.register(WorkHours)
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'position'] 
    search_fields = ['first_name', 'last_name', 'email', 'position']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name', 'description']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'due_date', 'assigned_to']
    search_fields = ['name', 'status']

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
