from rest_framework import serializers
from .models import Employee, Project, Task, TimeEntry, ClockInRecord, BreakRecord, LeaveRequest,LeaveBalance
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


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
    hours_worked = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)  # Use model field name
    extra_hours = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)  # Align with model
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)  # Add user_id to response
    user = serializers.StringRelatedField()  # Keep this if you still want to display the user by username or email
    breaks = BreakRecordSerializer(many=True, read_only=True, source='breakrecord_set')

    class Meta:
        model = ClockInRecord
        fields = ['id', 'user', 'user_id', 'time_clocked_in', 'time_clocked_out', 'hours_worked', 'extra_hours', 'breaks']


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['employee_name', 'employee_email', 'leave_type', 'start_date', 'end_date', 'reason', 'status']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = ['annual', 'sick', 'casual', 'maternity']