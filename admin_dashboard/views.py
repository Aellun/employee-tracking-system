from rest_framework import generics
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from rest_framework.exceptions import NotFound
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Avg, Count,Q
from django.db import connection
from django.db.models import Value
from django.db.models.functions import Concat
from rest_framework.decorators import api_view, permission_classes
from timesystem.models import Employee, Project, Task, LeaveBalance, TimeEntry, ClockInRecord, LeaveRequest,Performance,WorkHours
from .serializers import (
    EmployeeSerializer, 
    ProjectSerializer, 
    TaskSerializer, 
    TimeEntrySerializer, 
    LeaveRequestSerializer, 
    LeaveBalanceSerializer,
    ClockInRecordSerializer,
    UserSerializer,
    PerformanceSerializer,
    WorkHoursSerializer
)
import logging

logger = logging.getLogger(__name__)

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View to manage a single project by ID
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- List and create employees ---
@permission_classes([IsAuthenticated])
class EmployeeListView(APIView):

    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Check if the user is an admin before allowing POST
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to create employees.'}, status=status.HTTP_403_FORBIDDEN)

        # Include the user in the employee data
        data = request.data.copy()  # Make a copy of the incoming data
        data['user'] = request.user.id  # Automatically assign the current user

        serializer = EmployeeSerializer(data=data)  # Pass the modified data with user included
        if serializer.is_valid():
            employee = serializer.save(created_by=request.user)  # Save the new employee
            return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Retrieve, update, and delete an employee ---
class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def put(self, request, *args, **kwargs):
        # Check if the user is an admin before allowing updates
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to update employees.'}, status=status.HTTP_403_FORBIDDEN)

        # Get the employee instance to update
        employee = self.get_object()

        # Ensure the user field is not modified
        request.data['user'] = employee.user.id  # Retain the current user ID

        # Use the serializer to validate and save the updated employee data
        serializer = self.get_serializer(employee, data=request.data, partial=True)  # Use partial=True for partial updates
        if serializer.is_valid():
            updated_employee = serializer.save()  # Save the updated employee
            return Response(EmployeeSerializer(updated_employee).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to delete employees.'}, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)


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

    def get_object(self, leave_id):
        try:
            return LeaveRequest.objects.get(id=leave_id)
        except LeaveRequest.DoesNotExist:
            return None

    def put(self, request, leaveId, *args, **kwargs):  # Match the URL path parameter 'leaveId'
        leave_request = self.get_object(leaveId)  # Pass leaveId to get_object
        if not leave_request:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LeaveRequestSerializer(leave_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        leave_id = kwargs.get('leaveId')  # Retrieve leaveId from kwargs
        leave_request = self.get_object(leave_id)
        if not leave_request:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        leave_request.delete()
        return Response({'message': 'Leave request deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)



# List and Create Tasks
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print("Request data:", self.request.data)
        print(serializer.validated_data)
        serializer.save()

# Retrieve, Update, and Delete Task
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)  # Allow partial updates (PATCH)
        instance = self.get_object()
        logger.info(f"Updating Task: {instance.id}")
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Deleting Task: {instance.id}")
        self.perform_destroy(instance)
        return Response(status=204)  # No Content
    
class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Fetch Users for Task Assignment
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]    

class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related('assigned_to', 'project').annotate(
            assigned_to_full_name=Concat(
                'assigned_to__first_name',
                Value(' '),
                'assigned_to__last_name'
            )
        )
    

# Fetch all clock-in records or create a new one
@api_view(['GET', 'POST'])
def clockin_list(request):
    if request.method == 'GET':
        records = ClockInRecord.objects.all()
        serializer = ClockInRecordSerializer(records, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = ClockInRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Fetch, update, or delete a specific clock-in record
@api_view(['GET', 'PUT', 'DELETE'])
def clockin_detail(request, pk):
    try:
        record = ClockInRecord.objects.get(pk=pk)
    except ClockInRecord.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ClockInRecordSerializer(record)
        return Response(serializer.data)
    
    if request.method == 'PUT':
        serializer = ClockInRecordSerializer(record, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

 # report section
class LeaveBalanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leave_balances = LeaveBalance.objects.all()
        data = [
            {
                'user': balance.user.username,
                'annual': balance.annual,
                'sick': balance.sick,
                'casual': balance.casual,
                'maternity': balance.maternity
            }
            for balance in leave_balances
        ]
        return Response(data)

class LeaveRequestReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve query parameters
        employee_name = request.query_params.get('employeeName', None)
        leave_type = request.query_params.get('leaveType', None)
        status = request.query_params.get('status', None)
        start_date = request.query_params.get('startDate', None)
        end_date = request.query_params.get('endDate', None)

        # Start with all leave requests
        leave_requests = LeaveRequest.objects.all()

        # Apply filters
        if employee_name:
            leave_requests = leave_requests.filter(employee_name__icontains=employee_name)
        if leave_type:
            leave_requests = leave_requests.filter(leave_type=leave_type)
        if status:
            leave_requests = leave_requests.filter(status=status)
        if start_date:
            leave_requests = leave_requests.filter(start_date__gte=start_date)
        if end_date:
            leave_requests = leave_requests.filter(end_date__lte=end_date)

        # Prepare the response data
        data = [
            {
                'employee_name': req.employee_name,
                'employee_email': req.employee_email,
                'leave_type': req.leave_type,
                'start_date': req.start_date,
                'end_date': req.end_date,
                'status': req.status,
                'reason': req.reason,
            }
            for req in leave_requests
        ]
        
        return Response(data)

class WorkHoursReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve query parameters
        user_id = request.query_params.get('user')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Filter records based on user and date range if provided
        clock_in_records = ClockInRecord.objects.all()
        
        if user_id:
            clock_in_records = clock_in_records.filter(user_id=user_id)
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            clock_in_records = clock_in_records.filter(time_clocked_in__date__gte=start_date)
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            clock_in_records = clock_in_records.filter(time_clocked_out__date__lte=end_date)

        # Helper function to format hours and minutes
        def format_duration(duration):
            total_minutes = int(duration.total_seconds() // 60)
            hours, minutes = divmod(total_minutes, 60)
            return f"{hours} hrs {minutes} mins"

        # Prepare the response data with formatted dates and times
        data = [
            {
                'user': f"{record.user.first_name} {record.user.last_name}",
                'clocked_in': record.time_clocked_in.strftime('%d/%m/%Y %I:%M %p'),
                'clocked_out': (
                    record.time_clocked_out.strftime('%d/%m/%Y %I:%M %p')
                    if record.time_clocked_out else 'Still clocked in'
                ),
                'hours_worked': format_duration(timedelta(hours=float(record.hours_worked))),
                'extra_hours': format_duration(timedelta(hours=float(record.extra_hours)))
            }
            for record in clock_in_records
        ]

        return Response(data)


class ProjectTaskReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve query parameters for filtering
        project_name = request.query_params.get('project_name')
        status = request.query_params.get('status')
        assigned_to = request.query_params.get('assigned_to')
        due_date = request.query_params.get('due_date')

        # Filter tasks based on provided parameters
        tasks = Task.objects.all()

        if project_name:
            tasks = tasks.filter(project__name__icontains=project_name)
        
        if status:
            tasks = tasks.filter(status__icontains=status)
        
        if assigned_to:
            tasks = tasks.filter(assigned_to__username__icontains=assigned_to)
        
        if due_date:
            try:
                due_date = parse_date(due_date)
                tasks = tasks.filter(due_date=due_date)
            except ValueError:
                pass  # Ignore invalid date formats

        # Group tasks by project for a structured response
        project_data = {}
        for task in tasks:
            project_name = task.project.name
            if project_name not in project_data:
                project_data[project_name] = {
                    'project': project_name,
                    'tasks': []
                }
            project_data[project_name]['tasks'].append({
                'task_name': task.name,
                'status': task.status,
                'assigned_to': f"{task.assigned_to.first_name} {task.assigned_to.last_name}" if task.assigned_to else "Unassigned",
                'due_date': task.due_date.strftime('%d/%m/%Y') if task.due_date else 'No due date'
            })

        # Convert project data to a list for JSON response compatibility
        data = list(project_data.values())
        
        return Response(data)

class ProjectTaskReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        data = []

        for project in projects:
            tasks = Task.objects.filter(assigned_to__project=project)
            task_data = [
                {
                    'task_name': task.name,
                    'status': task.status,
                    'assigned_to': task.assigned_to.username,
                    'due_date': task.due_date
                }
                for task in tasks
            ]
            data.append({
                'project': project.name,
                'tasks': task_data
            })
        
        return Response(data)

class BillableHoursReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        time_entries = TimeEntry.objects.filter(is_billable=True)
        data = [
            {
                'employee': entry.employee.first_name + " " + entry.employee.last_name,
                'task': entry.task.name,
                'start_time': entry.start_time,
                'end_time': entry.end_time,
                'billable_hours': (entry.end_time - entry.start_time).total_seconds() / 3600 if entry.end_time else 0
            }
            for entry in time_entries
        ]
        return Response(data)


class PerformanceMetricsReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        completed_tasks = Task.objects.filter(status='completed').count()
        pending_tasks = Task.objects.filter(status='pending').count()
        in_progress_tasks = Task.objects.filter(status='in_progress').count()

        data = {
            'total_completed': completed_tasks,
            'total_pending': pending_tasks,
            'total_in_progress': in_progress_tasks,
        }
        return Response(data)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def aggregated_reports(request):
    try:
        # Check if the user is a valid employee
        employee = Employee.objects.filter(user=request.user).first()
        if not employee:
            return Response({"error": "Employee record not found for the current user."}, status=status.HTTP_404_NOT_FOUND)

        # Calculate various statistics
        task_completed_count = Task.objects.filter(status='completed').count()
        task_pending_count = Task.objects.filter(status='pending').count()
        total_tasks_count = Task.objects.count()

        leave_approved_count = LeaveRequest.objects.filter(status='approved').count()
        leave_pending_count = LeaveRequest.objects.filter(status='pending').count()
        leave_rejected_count = LeaveRequest.objects.filter(status='rejected').count()
        total_leave_requests = LeaveRequest.objects.count()

        average_hours_worked = ClockInRecord.objects.filter(hours_worked__gt=0).aggregate(Avg('hours_worked'))['hours_worked__avg'] or 0

        # Calculate rates
        task_completion_rate = (task_completed_count / total_tasks_count * 100) if total_tasks_count else 0
        leave_request_rate = (leave_approved_count / total_leave_requests * 100) if total_leave_requests else 0
        leave_approval_rate = (leave_approved_count / total_leave_requests * 100) if total_leave_requests else 0
        # Construct the response data
        aggregated_data = {
            "task_statistics": {
                "total_tasks": total_tasks_count,
                "completed": task_completed_count,
                "pending": task_pending_count,
                "completion_rate": task_completion_rate,
            },
            "leave_statistics": {
                "total_leave_requests": total_leave_requests,
                "approved": leave_approved_count,
                "pending": leave_pending_count,
                "approval_rate": leave_approval_rate,
            },
            "average_hours_worked": average_hours_worked,
            "leave_request_rate": leave_request_rate,
        }

        return Response(aggregated_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the specific error for debugging
        print(f"Error in aggregated_reports: {str(e)}")
        return Response({"error": "An error occurred while processing your request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Performance API views
class PerformanceListCreateView(generics.ListCreateAPIView):
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer

class PerformanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer

# WorkHours API views
class WorkHoursListCreateView(generics.ListCreateAPIView):
    queryset = WorkHours.objects.all()
    serializer_class = WorkHoursSerializer

class WorkHoursDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkHours.objects.all()
    serializer_class = WorkHoursSerializer