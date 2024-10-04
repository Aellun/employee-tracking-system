from rest_framework import viewsets, decorators, response, status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import AnonymousUser
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User

from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from .models import (
    Employee,
    Project,
    Task,
    TimeEntry,
    ClockInRecord,
    Break
)

from .serializers import (
    EmployeeSerializer,
    ProjectSerializer,
    TaskSerializer,
    TimeEntrySerializer,
    ClockInRecordSerializer,
    BreakSerializer
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

class ClockInRecordViewSet(viewsets.ModelViewSet):
    queryset = ClockInRecord.objects.all()
    serializer_class = ClockInRecordSerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    @csrf_exempt
    def clock_in(self, request):
        user = request.user
        
        # Ensure the user is authenticated
        if isinstance(user, AnonymousUser):
            return Response({"error": "Authentication required"}, status=401)

        clock_in_time = timezone.now()
        
        # Check if the user has an existing clock-in record
        existing_record = ClockInRecord.objects.filter(user=user, clock_out_time__isnull=True).first()

        if existing_record:
            return Response({"error": "Already clocked in"}, status=400)

        # Create the new clock-in record
        record = ClockInRecord.objects.create(user=user, clock_in_time=clock_in_time)
        return Response({"message": "Clocked in successfully", "data": ClockInRecordSerializer(record).data})
    # Custom action to handle clocking out
    @action(detail=True, methods=['post'])
    def clock_out(self, request, pk=None):
        record = self.get_object()
        record.clock_out_time = timezone.now()
        total_hours = (record.clock_out_time - record.clock_in_time).total_seconds() / 3600
        record.total_hours = total_hours
        if total_hours > 8:
            record.extra_hours = total_hours - 8
        record.save()
        return Response({"message": "Clocked out successfully", "data": ClockInRecordSerializer(record).data})

    # Custom action to handle breaks
    @action(detail=True, methods=['post'])
    def take_break(self, request, pk=None):
        record = self.get_object()
        break_type = request.data.get('break_type')
        break_notes = request.data.get('break_notes')
        break_start = timezone.now()
        break_instance = Break.objects.create(clock_in_record=record, break_type=break_type, break_start=break_start, break_notes=break_notes)
        return Response({"message": "Break started", "data": BreakSerializer(break_instance).data})

    # Custom action to end a break
    @action(detail=True, methods=['post'])
    def end_break(self, request, pk=None):
        break_instance = Break.objects.get(id=request.data.get('break_id'))
        break_instance.break_end = timezone.now()
        break_instance.save()
        return Response({"message": "Break ended", "data": BreakSerializer(break_instance).data})

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Debugging log
        print(f"Received email: {email}, password: {password}") 

        try:
            # Attempt to find the user by email
            user = User.objects.get(email=email)
            # Check password
            if user.check_password(password):
                # Token generation logic here, replace 'your_token_here' with actual token generation logic
                return Response({'token': 'your_token_here'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)