# admin_dashboard/serializers.py

from rest_framework import serializers
from timesystem.models import Employee, Project, Task, TimeEntry, ClockInRecord, JobRecord, BreakRecord, LeaveRequest, LeaveBalance

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

    def validate(self, attrs):
        """Custom validation to ensure end_time is after start_time."""
        if attrs.get('end_time') and attrs.get('start_time') and attrs['end_time'] < attrs['start_time']:
            raise serializers.ValidationError("End time must be after start time.")
        return attrs


class ClockInRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClockInRecord
        fields = '__all__'

    def validate(self, attrs):
        """Custom validation to ensure time clocked out is after clocked in."""
        if attrs.get('time_clocked_out') and attrs['time_clocked_out'] < attrs['time_clocked_in']:
            raise serializers.ValidationError("Clocked out time must be after clocked in time.")
        return attrs


class JobRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRecord
        fields = '__all__'


class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = '__all__'

    def validate(self, attrs):
        """Custom validation to ensure break end time is after start time."""
        if attrs.get('time_ended') and attrs.get('time_started') and attrs['time_ended'] < attrs['time_started']:
            raise serializers.ValidationError("End time must be after start time for the break.")
        return attrs


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'


class LeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = '__all__'
