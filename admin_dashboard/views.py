from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from .models import Employee, Project, Task, LeaveBalance, TimeEntry, ClockInRecord, LeaveRequest
from .serializers import EmployeeSerializer, ProjectSerializer, TimeEntrySerializer


# --- List and create employees ---
class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]


# --- List and create projects ---
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


# --- List and create time entries ---
class TimeEntryListCreateView(generics.ListCreateAPIView):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]


# --- List all employees (for use in employee management) ---
@require_http_methods(["GET"])
@login_required
def list_users(request):
    employees = Employee.objects.all()
    employee_data = [{"id": emp.id, "name": f"{emp.first_name} {emp.last_name}", "email": emp.email} for emp in employees]
    return JsonResponse(employee_data, safe=False, status=200)


# --- Delete a user by ID (for user management) ---
@require_http_methods(["POST"])
@login_required
def delete_user(request, user_id):
    try:
        user = get_object_or_404(Employee, id=user_id)  # Changed to Employee model
        user.delete()
        return JsonResponse({"message": "User deleted successfully"}, status=200)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- Employee statistics (total employees and positions) ---
@login_required
def employee_statistics(request):
    total_employees = Employee.objects.count()
    total_positions = Employee.objects.values('role').distinct().count()  # Changed 'position' to 'role'

    return JsonResponse({
        'total_employees': total_employees,
        'total_positions': total_positions
    })


# --- Project overview (total projects) ---
@login_required
def project_overview(request):
    total_projects = Project.objects.count()
    projects_data = list(Project.objects.values('name', 'description'))

    return JsonResponse({
        'total_projects': total_projects,
        'projects': projects_data
    })


# --- Task statistics (grouped by status) ---
@login_required
def task_statistics(request):
    task_statuses = Task.objects.values('status').annotate(count=Count('status'))

    return JsonResponse({
        'task_statuses': list(task_statuses)
    })


# --- Time entry statistics (total entries and billable hours) ---
@login_required
def time_entry_statistics(request):
    total_time_entries = TimeEntry.objects.count()
    billable_hours = TimeEntry.objects.filter(is_billable=True).count()

    return JsonResponse({
        'total_time_entries': total_time_entries,
        'billable_hours': billable_hours
    })


# --- Clock-In statistics (total clock-ins and active clock-ins) ---
@login_required
def clockin_statistics(request):
    total_clockins = ClockInRecord.objects.count()
    active_clockins = ClockInRecord.objects.filter(time_clocked_out__isnull=True).count()

    return JsonResponse({
        'total_clockins': total_clockins,
        'active_clockins': active_clockins
    })


# --- Leave request statistics (total and pending leaves) ---
@login_required
def leave_request_statistics(request):
    total_leaves = LeaveRequest.objects.count()
    pending_leaves = LeaveRequest.objects.filter(status='PENDING').count()

    return JsonResponse({
        'total_leaves': total_leaves,
        'pending_leaves': pending_leaves
    })


# --- Leave balance statistics (summed leave types per user) ---
@login_required
def leave_balance_statistics(request):
    leave_balances = LeaveBalance.objects.values(
        'user__username', 'annual', 'sick', 'casual', 'maternity'
    )

    return JsonResponse({
        'leave_balances': list(leave_balances)
    })


# --- Admin statistics (aggregates multiple stats for the dashboard) ---
@login_required
def admin_statistics(request):
    total_employees = Employee.objects.count()
    total_projects = Project.objects.count()
    total_tasks = Task.objects.count()
    total_clockins = ClockInRecord.objects.count()
    total_breaks_taken = TimeEntry.objects.filter(is_break=True).count()  # Assuming breaks are flagged
    total_leave_requests = LeaveRequest.objects.count()

    leave_balances = LeaveBalance.objects.aggregate(
        total_annual=Sum('annual'),
        total_sick=Sum('sick'),
        total_casual=Sum('casual'),
        total_maternity=Sum('maternity')
    )

    data = {
        'totalEmployees': total_employees,
        'totalProjects': total_projects,
        'totalTasks': total_tasks,
        'totalClockIns': total_clockins,
        'totalBreaksTaken': total_breaks_taken,
        'totalLeaveRequests': total_leave_requests,
        'leaveBalances': {
            'annual': leave_balances['total_annual'] or 0,
            'sick': leave_balances['total_sick'] or 0,
            'casual': leave_balances['total_casual'] or 0,
            'maternity': leave_balances['total_maternity'] or 0,
        }
    }

    return JsonResponse(data)
