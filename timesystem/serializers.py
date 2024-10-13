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
        fields = ['id', 'name', 'description', 'due_date', 'status', 'assigned_to']

class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status', 'notes']
        
    def validate(self, data):
        if data['status'] == 'completed' and not data.get('notes'):
            raise serializers.ValidationError("Notes are required when marking a task as completed.")
        return data

class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = '__all__'

class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = ['break_type', 'break_notes', 'start_time', 'end_time', 'duration']  # Include relevant fields

class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = '__all__'  # Adjust this as necessary to include specific fields

class ClockInRecordSerializer(serializers.ModelSerializer):
    breaks = BreakRecordSerializer(many=True, read_only=True)  # Fetch associated break records
    hours_worked = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)  # Make sure to use model field name
    extra_hours = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)  # Ensure this aligns with your model
    user = serializers.StringRelatedField()  # Display user by username or email
    breaks = BreakRecordSerializer(many=True, read_only=True, source='breakrecord_set')
    class Meta:
        model = ClockInRecord
        fields = ['id', 'user', 'time_clocked_in', 'time_clocked_out', 'hours_worked', 'extra_hours', 'breaks']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
