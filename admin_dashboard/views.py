from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAdminUser
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from timesystem.models import Employee, Project, Task, LeaveBalance, TimeEntry, ClockInRecord, LeaveRequest
from .serializers import (
    EmployeeSerializer, 
    ProjectSerializer, 
    TaskSerializer, 
    TimeEntrySerializer, 
    LeaveRequestSerializer, 
    LeaveBalanceSerializer,
    ClockInRecordSerializer
)

# --- List and create employees ---
class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]


# --- Retrieve, update, and delete an employee ---
class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]


# --- List and create projects ---
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


# --- Retrieve, update, and delete a project ---
class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


# --- List and create time entries ---
class TimeEntryListCreateView(generics.ListCreateAPIView):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]


# --- Retrieve, update, and delete a time entry ---
class TimeEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]


# --- List and create leave requests ---
class LeaveRequestListCreateView(generics.ListCreateAPIView):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]


# --- Retrieve, update, and delete a leave request ---
class LeaveRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]


# --- List and create leave balances ---
class LeaveBalanceListCreateView(generics.ListCreateAPIView):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]


# --- Retrieve, update, and delete a leave balance ---
class LeaveBalanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]


# --- Clock In Records CRUD ---
class ClockInRecordListCreateView(generics.ListCreateAPIView):
    queryset = ClockInRecord.objects.all()
    serializer_class = ClockInRecordSerializer
    permission_classes = [IsAuthenticated]


class ClockInRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClockInRecord.objects.all()
    serializer_class = ClockInRecordSerializer
    permission_classes = [IsAuthenticated]


# --- Employee statistics (total employees and positions) ---
@login_required
def employee_statistics(request):
    total_employees = Employee.objects.count()
    total_positions = Employee.objects.values('position').distinct().count()  # Changed 'role' to 'position'

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


class AdminStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_employees = Employee.objects.count()
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        total_clockins = ClockInRecord.objects.count()
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
            'totalLeaveRequests': total_leave_requests,
            'leaveBalances': {
                'annual': leave_balances['total_annual'] or 0,
                'sick': leave_balances['total_sick'] or 0,
                'casual': leave_balances['total_casual'] or 0,
                'maternity': leave_balances['total_maternity'] or 0,
            }
        }

        return JsonResponse(data)


class LeaveRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leave_requests = LeaveRequest.objects.all()
        
        # Get query parameters for filtering
        employee_name = request.query_params.get('employee_name', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        status_param = request.query_params.get('status', None)

        # Apply filters
        if employee_name:
            leave_requests = leave_requests.filter(employee_name__icontains=employee_name)
        if start_date:
            parsed_start_date = parse_datetime(start_date)
            if parsed_start_date:
                leave_requests = leave_requests.filter(start_date__gte=parsed_start_date)
        if end_date:
            parsed_end_date = parse_datetime(end_date)
            if parsed_end_date:
                leave_requests = leave_requests.filter(end_date__lte=parsed_end_date)
        if status_param:
            leave_requests = leave_requests.filter(status=status_param)

        serializer = LeaveRequestSerializer(leave_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LeaveRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, leaveId):
        try:
            return LeaveRequest.objects.get(id=leaveId)
        except LeaveRequest.DoesNotExist:
            return None

    def put(self, request, leave_id, *args, **kwargs):
        leave_request = self.get_object(leave_id)
        if not leave_request:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LeaveRequestSerializer(leave_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, leaveId):
        leave_request = self.get_object(leaveId)
        if not leave_request:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        leave_request.delete()
        return Response({'message': 'Leave request deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    
@permission_classes([IsAdminUser])
class EmployeeListView(APIView):
    
    def get(self, request):
        print(request.headers)
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Check if the user is an admin before allowing POST
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to create employees.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAdminUser])
class EmployeeDetailView(APIView):
    def get_object(self, employee_id):
        return get_object_or_404(Employee, id=employee_id)

    def get(self, request, employee_id):
        employee = self.get_object(employee_id)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, employee_id):
        # Check if the user is an admin before allowing PUT
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to update employees.'}, status=status.HTTP_403_FORBIDDEN)

        employee = self.get_object(employee_id)
        serializer = EmployeeSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, employee_id):
        # Check if the user is an admin before allowing DELETE
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to delete employees.'}, status=status.HTTP_403_FORBIDDEN)

        employee = self.get_object(employee_id)
        employee.delete()
        return Response({'message': 'Employee deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)