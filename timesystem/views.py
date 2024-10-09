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

from .models import (
    Employee,
    Project,
    Task,
    TimeEntry,
    ClockInRecord,
    BreakRecord,
)

from .serializers import (
    EmployeeSerializer,
    ProjectSerializer,
    TaskSerializer,
    TimeEntrySerializer,
)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Print received token if available (debugging)
        print(f"Token received: {request.headers.get('Authorization')}")

        # Get the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate using username (since authenticate requires username)
        user = authenticate(request, username=user.username, password=password)

        if user is not None:
            if user.is_active:
                # Log the user's is_staff value for debugging purposes
                print(f"User {user.email} is_admin (is_staff): {user.is_staff}")

                # Generate or get an existing token
                token, _ = Token.objects.get_or_create(user=user)
                
                # Return response with token and admin status (is_admin)
                return Response({
                    'token': token.key,
                    'is_admin': user.is_staff,  # Check if the user is an admin
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'User account is disabled'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    user = request.user
    print(f"User: {user.email}, is_active: {user.is_active}, is_authenticated: {user.is_authenticated}")
    record = ClockInRecord.objects.create(user=user)
    return Response({'message': 'Clocked in successfully', 'record_id': record.id}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    print("Data received from frontend:", request.data)
    record_id = request.data.get('record_id')  # Make sure this is sent in the request body
    
    # Check if record_id is provided
    if record_id is None:
        return Response({'error': 'record_id not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Fetch the clock-in record for the authenticated user
        record = ClockInRecord.objects.get(id=record_id, user=request.user)
        
        # Update the clock-out time
        record.time_clocked_out = timezone.now()
        
        # Calculate worked hours
        worked_hours = (record.time_clocked_out - record.time_clocked_in).total_seconds() / 3600
        record.hours_worked = round(worked_hours, 2)
        
        # Save the record
        record.save()
        
        # Prepare the response data
        response_data = {
            'message': 'Clocked out successfully',
            'hours_worked': record.hours_worked
        }
        print("Response data to be sent:", response_data)
        return Response(response_data, status=status.HTTP_200_OK)
    
    except ClockInRecord.DoesNotExist:
        return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_break(request):
    try:
        # Fetch the break record by ID
        break_id = request.data.get('break_id')
        break_record = BreakRecord.objects.get(id=break_id, clock_in_record__user=request.user, time_ended__isnull=True)

        # Set the time_ended field
        break_record.time_ended = timezone.now()
        break_record.save()

        # Calculate break duration
        duration = break_record.duration()

        return Response({
            'message': 'Break ended successfully',
            'break_id': break_record.id,
            'break_duration': duration
        }, status=status.HTTP_200_OK)
    
    except BreakRecord.DoesNotExist:
        return Response({'error': 'Break record not found or already ended'}, status=status.HTTP_404_NOT_FOUND)

class SimpleAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Authenticated!"})