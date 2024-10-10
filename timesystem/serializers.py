from rest_framework import serializers
from .models import Employee, Project, Task, TimeEntry, ClockInRecord, BreakRecord
from django.contrib.auth.models import User

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'completed', 'assigned_to']

class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = '__all__'

class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = ['break_type', 'break_notes', 'start_time', 'end_time', 'duration']  # Include relevant fields

class ClockInRecordSerializer(serializers.ModelSerializer):
    breaks = BreakRecordSerializer(many=True, read_only=True)  # Fetch associated break records
    total_hours = serializers.FloatField(read_only=True)
    extra_hours = serializers.FloatField(read_only=True)
    user = serializers.StringRelatedField()  # Display user by username or email

    class Meta:
        model = ClockInRecord
        fields = ['id', 'clock_in_time', 'clock_out_time', 'total_hours', 'extra_hours', 'job_name', 'notes', 'user', 'breaks']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
