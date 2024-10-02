from rest_framework import viewsets
from .models import Employee, Project, Task, TimeEntry
from .serializers import EmployeeSerializer, ProjectSerializer, TaskSerializer, TimeEntrySerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

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

@api_view(['POST'])
def clock_out(request):
    notes = request.data.get('notes')
    job = request.data.get('job')
    # Save clock-out data, notes, and job to the database
    return Response({"message": "Clocked out successfully"})