from rest_framework import viewsets, response, status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import generics

from .models import (
    Employee,
    Project,
    Task,
    TimeEntry,
    ClockInRecord,
    BreakRecord,
    ClockInRecord
)

from .serializers import (
    EmployeeSerializer,
    ProjectSerializer,
    TaskSerializer,
    TimeEntrySerializer,
    TaskUpdateSerializer,
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

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer

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
    print(f"User: {user.email}, is_active: {user.is_active}, is_authenticated: {user.is_authenticated}")
    record = ClockInRecord.objects.create(user=user)
    return Response({'message': 'Clocked in successfully', 'record_id': record.id}, status=status.HTTP_201_CREATED)

# Clock-Out Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    print("Data received from frontend:", request.data)
    record_id = request.data.get('record_id')  # Make sure this is sent in the request body
    
    if record_id is None:
        return Response({'error': 'record_id not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        record = ClockInRecord.objects.get(id=record_id, user=request.user)
        record.time_clocked_out = timezone.now()
        worked_hours = (record.time_clocked_out - record.time_clocked_in).total_seconds() / 3600
        record.hours_worked = round(worked_hours, 2)
        record.save()
        
        response_data = {
            'message': 'Clocked out successfully',
            'hours_worked': record.hours_worked
        }
        print("Response data to be sent:", response_data)
        return Response(response_data, status=status.HTTP_200_OK)
    
    except ClockInRecord.DoesNotExist:
        return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

# Start Break Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def take_break(request):
    print("Request data:", request.data)  # Add this line to check what data is being received
    record_id = request.data.get('record_id')
    break_type = request.data.get('break_type')
    break_notes = request.data.get('break_notes', '')

    try:
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

    except ClockInRecord.DoesNotExist:
        return Response({'error': 'Clock-in record not found'}, status=status.HTTP_404_NOT_FOUND)

# End Break Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_break(request):
    try:
        break_id = request.data.get('break_id')
        break_record = BreakRecord.objects.get(id=break_id, clock_in_record__user=request.user, time_ended__isnull=True)
        break_record.time_ended = timezone.now()
        break_record.save()
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
