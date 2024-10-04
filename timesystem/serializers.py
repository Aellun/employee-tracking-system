from rest_framework import serializers
from .models import Employee, Project, Task, TimeEntry,ClockInRecord, Break
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
        fields = '__all__'

class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = '__all__'

class BreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Break
        fields = '__all__'

class ClockInRecordSerializer(serializers.ModelSerializer):
    breaks = BreakSerializer(many=True, read_only=True)

    class Meta:
        model = ClockInRecord
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']