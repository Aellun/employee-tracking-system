# admin_dashboard/serializers.py  

from rest_framework import serializers  
from django.contrib.auth import get_user_model  
from timesystem.models import Employee, Project, Task, TimeEntry, ClockInRecord, JobRecord, BreakRecord,LeaveRequest, LeaveBalance, Performance, WorkHours

User = get_user_model()  

class UserSerializer(serializers.ModelSerializer):  
    class Meta:  
        model = User  
        fields = ['id', 'first_name', 'last_name', 'email', 'date_joined' ]  

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

    def validate_email(self, value):
        # Check if the employee already exists and has a different ID
        if self.instance:
            if Employee.objects.exclude(id=self.instance.id).filter(email=value).exists():
                raise serializers.ValidationError("User email already exists.")
        else:
            # This is for the creation case where self.instance is None
            if Employee.objects.filter(email=value).exists():
                raise serializers.ValidationError("User email already exists.")
        return value

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


    # Optional custom update logic for partial updates
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.status = validated_data.get('status', instance.status)
        instance.assigned_to = validated_data.get('assigned_to', instance.assigned_to)
        instance.save()
        return instance
    

class PerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performance
        fields = ['id', 'user', 'tasks_completed', 'tasks_assigned', 'efficiency_rate', 'review_date']
        read_only_fields = ['id', 'review_date', 'efficiency_rate']
        
        # Optional: Calculate efficiency dynamically if not stored in the model
        def to_representation(self, instance):
            representation = super().to_representation(instance)
            if instance.tasks_assigned > 0:
                representation['efficiency_rate'] = (instance.tasks_completed / instance.tasks_assigned) * 100
            else:
                representation['efficiency_rate'] = 0
            return representation
        

class WorkHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHours
        fields = ['id', 'user', 'clock_in_time', 'clock_out_time', 'total_hours']
        read_only_fields = ['id', 'total_hours']

    # Optional: Auto-calculate total hours if clock_out_time is provided
    def validate(self, data):
        if data.get('clock_out_time') and data.get('clock_in_time'):
            if data['clock_out_time'] < data['clock_in_time']:
                raise serializers.ValidationError("Clock out time cannot be before clock in time.")
        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.clock_out_time:
            instance.calculate_total_hours()  # Calculate the total hours
        return representation