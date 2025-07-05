from rest_framework import viewsets, response, status
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import generics
from django.contrib.auth.decorators import login_required
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.exceptions import ValidationError


from .models import (
    Employee,
    Project,
    Task,
    TimeEntry,
    ClockInRecord,
    BreakRecord,
    ClockInRecord,
    LeaveRequest,
    LeaveBalance,
    Department, Role,
    WorkHours, PerformanceReview
)

from .serializers import (
    EmployeeSerializer,
    ProjectSerializer,
    TaskSerializer,
    TimeEntrySerializer,
    TaskUpdateSerializer,
    ClockInRecordSerializer,
    BreakRecordSerializer,
    LeaveRequestSerializer,
    LeaveBalanceSerializer,
    DepartmentSerializer, RoleSerializer,
    WorkHoursSerializer, PerformanceReviewSerializer  
)

User = get_user_model()

# Custom JWT Token Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_admin'] = user.is_staff  # Include admin status in the token
        return token

# Custom JWT Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer


# Task ViewSet
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

# Leave Request ViewSet
class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

# Clock In Record ViewSet
class ClockInRecordViewSet(viewsets.ModelViewSet):
    queryset = ClockInRecord.objects.all()
    serializer_class = ClockInRecordSerializer

# Existing Login Logic
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Get the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate using username
        user = authenticate(request, username=user.username, password=password)

        if user is not None:
            if user.is_active:
                # Log the user's is_staff value for debugging purposes
                print(f"User {user.email} is_admin (is_staff): {user.is_staff}")

                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                # Return response with access token and admin status
                return Response({
                    'token': access_token,  # The access token to be used in further requests
                    'is_admin': user.is_staff,  # Check if the user is an admin
                    'username': user.username,
                    'user_id': user.id,
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'User account is disabled'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Clock-In Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    user = request.user
    # Check if the user already has an active clock-in record
    active_clock_in = ClockInRecord.objects.filter(user=user, time_clocked_out__isnull=True).first()
    
    if active_clock_in:
        return Response({'message': f'You are already clocked in at {active_clock_in.time_clocked_in}.'}, status=status.HTTP_400_BAD_REQUEST)
    
    record = ClockInRecord.objects.create(user=user)
    return Response({'message': 'Clocked in successfully', 'record_id': record.id}, status=status.HTTP_201_CREATED)

# Clock-Out Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    print("Data received from frontend:", request.data)
    record_id = request.data.get('record_id')  # Expect this in the request body
    
    # If no record_id provided, find the active clock-in
    if record_id is None:
        record = ClockInRecord.objects.filter(user=request.user, time_clocked_out__isnull=True).first()
        if not record:
            return Response({'error': 'No active clock-in found.'}, status=status.HTTP_400_BAD_REQUEST)
        record_id = record.id  # Use the active clock-in ID

    try:
        record = ClockInRecord.objects.get(id=record_id, user=request.user)
        if record.time_clocked_out is not None:
            return Response({'error': 'Record already clocked out.'}, status=status.HTTP_400_BAD_REQUEST)

        record.time_clocked_out = timezone.now()
        worked_hours = (record.time_clocked_out - record.time_clocked_in).total_seconds() / 3600
        record.hours_worked = round(worked_hours, 2)
        record.save()
        
        response_data = {
            'message': 'Clocked out successfully',
            'hours_worked': record.hours_worked,
            'clocked_out_at': record.time_clocked_out.strftime("%Y-%m-%d %H:%M:%S"),
        }
        print("Response data to be sent:", response_data)
        return Response(response_data, status=status.HTTP_200_OK)
    
    except ClockInRecord.DoesNotExist:
        return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)


# Check Active Break Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_active_break(request):
    record_id = request.query_params.get('record_id')
    if not record_id:
        return Response({'error': 'Record ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check for an active break associated with the clock-in record
        active_break = BreakRecord.objects.get(
            clock_in_record__id=record_id,
            clock_in_record__user=request.user,
            time_ended__isnull=True
        )
        return Response({
            'active': True,
            'break_id': active_break.id,
            'break_start_time': active_break.time_started,
            'clock_in_record__id': active_break.clock_in_record_id,
            'breakType':active_break.break_type,
            'record_id':active_break.clock_in_record_id
        }, status=status.HTTP_200_OK)

    except BreakRecord.DoesNotExist:
        # No active break found
        return Response({'active': False}, status=status.HTTP_200_OK)

# Start Break Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def take_break(request):
    record_id = request.data.get('record_id')
    break_type = request.data.get('break_type')
    break_notes = request.data.get('break_notes', '')

    # Check if the user has an active clock-in
    if not record_id or not ClockInRecord.objects.filter(
        id=record_id,
        user=request.user,
        time_clocked_out__isnull=True
    ).exists():
        return Response({'error': 'No active clock-in found to take a break.'}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure there isn't an ongoing break for the active clock-in
    active_break = BreakRecord.objects.filter(
        clock_in_record__id=record_id,
        clock_in_record__user=request.user,
        time_ended__isnull=True
    ).exists()
    if active_break:
        return Response({'error': 'There is already an active break for this clock-in.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a new break record
    clock_in_record = ClockInRecord.objects.get(id=record_id, user=request.user)
    break_record = BreakRecord.objects.create(
        clock_in_record=clock_in_record,
        break_type=break_type,
        break_notes=break_notes,
        time_started=timezone.now()
    )
    return Response({
        'message': 'Break started successfully',
        'break_id': break_record.id
    }, status=status.HTTP_201_CREATED)

# End Break Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_break(request):
    break_id = request.data.get('break_id')
    if not break_id:
        return Response({'error': 'Break ID is required to end the break.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the active break
        break_record = BreakRecord.objects.get(
            id=break_id,
            clock_in_record__user=request.user,
            time_ended__isnull=True
        )
        break_record.time_ended = timezone.now()
        break_record.save()
        
        # Calculate the duration of the break
        duration = break_record.duration()

        return Response({
            'message': 'Break ended successfully',
            'break_id': break_record.id,
            'break_duration': duration
        }, status=status.HTTP_200_OK)

    except BreakRecord.DoesNotExist:
        return Response({'error': 'Break record not found or already ended'}, status=status.HTTP_404_NOT_FOUND)

# Sample Authenticated View
class SimpleAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Authenticated!"})


class UserTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)
    

class TaskUpdateView(APIView):
    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent update if task is already marked as complete
        if task.status == 'completed':
            return Response({"error": "This task is marked as completed and cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent update if task is pending approval
        if task.status == 'waiting_for_approval':
            return Response({"error": "This task is pending approval and cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the task status and notes if the above conditions are not met
        serializer = TaskSerializer(task, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

def update(self, request, *args, **kwargs):
    task = self.get_object()

    # Only the assigned user can update the task
    if task.assigned_to != request.user:
        return Response({"error": "You are not authorized to update this task."}, status=status.HTTP_403_FORBIDDEN)

    # Prevent updates if the task is completed
    if task.status == 'completed':
        return Response({"error": "This task has been completed and cannot be updated."}, status=status.HTTP_400_BAD_REQUEST)

    # Apply status changes
    if request.data.get('status') == 'request_extension':
        task.status = 'awaiting_approval'
    elif request.data.get('status') == 'completed':
        task.status = 'completed'
    elif request.data.get('status') == 'in_progress':
        task.status = 'in_progress'

    # Save the notes and status
    task.notes = request.data.get('notes')
    task.save()

    return Response({"message": "Task updated successfully."}, status=status.HTTP_200_OK)


class TodayTasksView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer  # Add this line

    def get(self, request):
        # Filter tasks based on status
        tasks = Task.objects.filter(status__in=['pending', 'awaiting_approval'])
        serializer = self.serializer_class(tasks, many=True)  # Use the serializer to serialize the queryset
        return Response(serializer.data)


class ClockInStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Query for a clock-in record with no clock-out for today
        clock_in_record = ClockInRecord.objects.filter(user=user, time_clocked_out__isnull=True, time_clocked_in__date=today).first()

        if clock_in_record:
            # Return the clock-in time along with the clockedIn status
            return Response({
                'clockedIn': True,
                'time_clocked_in': clock_in_record.time_clocked_in
            })
        else:
            return Response({'clockedIn': False})
        
class TodayHoursWorkedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        hours_worked = ClockInRecord.get_today_hours(user)
        return Response({"hoursWorked": hours_worked}, status=200)
    

class TimesheetView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def get(self, request):
        user = request.user
        date = request.query_params.get('date')  # Get the date parameter from the request

        # Fetch clock-in records for the user
        clock_in_records = ClockInRecord.objects.filter(user=user)

        # If a date is provided, filter clock-in records by that date
        if date:
            clock_in_records = clock_in_records.filter(time_clocked_in__date=date)

        # Fetch breaks associated with the filtered clock-in records
        break_records = BreakRecord.objects.filter(clock_in_record__in=clock_in_records)

        # Create structured data for output
        structured_data = []
        for record in clock_in_records:
            # Calculate duration
            duration = self.calculate_duration(record.time_clocked_in, record.time_clocked_out)
            # Get associated breaks
            breaks = break_records.filter(clock_in_record=record)

            # Append record data along with breaks
            structured_data.append({
                'time_clocked_in': record.time_clocked_in.isoformat(),  # Return full ISO format
                'time_clocked_out': record.time_clocked_out.isoformat() if record.time_clocked_out else None,
                'duration': duration,
                'notes': "N/A",  # Remove this or set to default as ClockInRecord has no notes field
                'breaks': BreakRecordSerializer(breaks, many=True).data,
            })

        return Response(structured_data)

    def calculate_duration(self, time_in, time_out):
        if time_out:
            # Calculate total duration in seconds
            duration = time_out - time_in
            total_seconds = duration.total_seconds()  # Total duration in seconds

            # Calculate hours and minutes
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)

            # Return the formatted string
            if hours > 0:
                return f"{hours}h {minutes:02d}m"  # Format as "hh:mm"
            else:
                return f"{minutes}m"  # Return only minutes if less than an hour

        return "0m"  # Default if no time_out is available


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Require authentication
def check_active_clock_in(request):
    user = request.user  # Get the current logged-in user
    print(f"Checking active clock-in for user ID: {user.id}")
    try:
        # Check if there's an active clock-in record for the user
        active_clock_in = ClockInRecord.objects.filter(user=user, time_clocked_out__isnull=True).first()

        if active_clock_in:
            return Response({
                'active': True,
                'time_clocked_in': active_clock_in.time_clocked_in,
                'record_id': active_clock_in.id,
                'user_id': active_clock_in.user_id
            }, status=status.HTTP_200_OK)
        else:
            return Response({'active': False, 'record_id': None}, status=status.HTTP_200_OK)  # Include record_id as None

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaveBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve the user's leave balance, calculating any approved leave deductions."""
        user = request.user
        leave_balance, created = LeaveBalance.objects.get_or_create(
            user=user,
            defaults={
                'annual': 21,  # Default for annual leave
                'sick': 14,    # Default for sick leave
                'casual': 7,   # Default for casual leave
                'maternity': 40 # Default for maternity leave
            }
        )
        
        # Calculate and deduct approved leave days
        self._deduct_approved_leave_days(user, leave_balance)

        serializer = LeaveBalanceSerializer(leave_balance)
        return Response(serializer.data)

    def _deduct_approved_leave_days(self, user, leave_balance):
        """Calculate and deduct days for all 'APPROVED' leave requests."""
        # Get all approved leave requests for this user
        approved_leaves = LeaveRequest.objects.filter(user=user, status='APPROVED')
        
        # Initialize counters for each leave type
        annual_days = 0
        sick_days = 0
        casual_days = 0
        maternity_days = 0

        # Calculate the total number of approved leave days for each type
        for leave in approved_leaves:
            start_date = leave.start_date
            end_date = leave.end_date
            leave_days = (end_date - start_date).days + 1  # Include end date
            
            if leave.leave_type == 'ANNUAL':
                annual_days += leave_days
            elif leave.leave_type == 'SICK':
                sick_days += leave_days
            elif leave.leave_type == 'CASUAL':
                casual_days += leave_days
            elif leave.leave_type == 'MATERNITY':
                maternity_days += leave_days

        # Deduct approved leave days from the balance based on defaults
        leave_balance.annual = max(21 - annual_days, 0)  # Default 21 days for annual
        leave_balance.sick = max(14 - sick_days, 0)      # Default 14 days for sick
        leave_balance.casual = max(7 - casual_days, 0)   # Default 7 days for casual
        leave_balance.maternity = max(40 - maternity_days, 0)  # Default 40 days for maternity

        # Save the updated leave balance
        leave_balance.save()

        # Debugging output
        print(f"Updated Leave Balances - Annual: {leave_balance.annual}, Sick: {leave_balance.sick}, Casual: {leave_balance.casual}, Maternity: {leave_balance.maternity}")


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class WorkHoursViewSet(viewsets.ModelViewSet):
    queryset = WorkHours.objects.all()
    serializer_class = WorkHoursSerializer
    permission_classes = [IsAuthenticated]


class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]