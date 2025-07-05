from django.contrib import admin
from timesystem.models import (
    Employee, Department, Role,
    Project, Task, TimeEntry,
    ClockInRecord, BreakRecord,
    LeaveRequest, LeaveBalance,
    Performance, WorkHours
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'description']
    search_fields = ['title']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'department', 'role', 'hire_date', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']

    def full_name(self, obj):
        return obj.user.get_full_name()

    def email(self, obj):
        return obj.user.email


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'due_date', 'assigned_to']
    search_fields = ['name']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['get_employee_name', 'leave_type', 'start_date', 'end_date', 'status']
    search_fields = ['employee__user__first_name', 'leave_type']

    def get_employee_name(self, obj):
        return obj.employee.user.get_full_name()
    get_employee_name.short_description = 'Employee'


@admin.register(ClockInRecord)
class ClockInRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'time_clocked_in', 'time_clocked_out', 'hours_worked']
    search_fields = ['user__username']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'annual', 'sick', 'casual', 'maternity']
    search_fields = ['user__username']


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_efficiency', 'get_recorded_on']

    def get_efficiency(self, obj):
        return obj.efficiency_percent
    get_efficiency.short_description = 'Efficiency %'

    def get_recorded_on(self, obj):
        return obj.recorded_on
    get_recorded_on.short_description = 'Recorded On'


@admin.register(WorkHours)
class WorkHoursAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_date', 'total_hours']

    def get_date(self, obj):
        return obj.date
    get_date.short_description = 'Date'
