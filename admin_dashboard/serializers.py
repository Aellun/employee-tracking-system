# admin_dashboard/serializers.py  

from rest_framework import serializers  
from django.contrib.auth import get_user_model  
from timesystem.models import Employee, Project, Task, TimeEntry, ClockInRecord, JobRecord, BreakRecord, LeaveRequest, LeaveBalance  

User = get_user_model()  # Use the dynamic user model  

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
        fields = '__all__'  # Removed the trailing comma


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'status', 'assigned_to']

    # Optional custom update logic for partial updates
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.status = validated_data.get('status', instance.status)
        instance.assigned_to = validated_data.get('assigned_to', instance.assigned_to)
        instance.save()
        return instance