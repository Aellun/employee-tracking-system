from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Employee,
    Department,
    Role,
    Project,
    Task,
    TimeEntry,
    ClockInRecord,
    BreakRecord,
    LeaveRequest,
    LeaveBalance,
    WorkHours, PerformanceReview
)

# --- User ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


# --- Department ---
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description']


# --- Role ---
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'title', 'level', 'description']


# --- Employee ---
class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    role = RoleSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), write_only=True, source='department')
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), write_only=True, source='role')

    class Meta:
        model = Employee
        fields = [
            'id',
            'user',
            'profile_picture',
            'contact_number',
            'address',
            'hire_date',
            'is_active',
            'department',
            'role',
            'department_id',
            'role_id'
        ]


# --- Project ---
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


# --- Task ---
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'status', 'assigned_to']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status', 'notes']

    def validate(self, data):
        if data['status'] == 'completed' and not data.get('notes'):
            raise serializers.ValidationError("Notes are required when marking a task as completed.")
        return data


# --- Time Entry ---
class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = '__all__'


# --- Break Record ---
class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = '__all__'


# --- Clock In Record ---
class ClockInRecordSerializer(serializers.ModelSerializer):
    breaks = BreakRecordSerializer(many=True, read_only=True, source='breakrecord_set')
    hours_worked = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    extra_hours = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = ClockInRecord
        fields = [
            'id', 'user', 'user_id',
            'time_clocked_in', 'time_clocked_out',
            'hours_worked', 'extra_hours', 'breaks'
        ]


# --- Leave Request ---
class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee', 'leave_type', 'start_date', 'end_date', 'reason', 'status']


# --- Leave Balance ---
class LeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = ['user', 'annual', 'sick', 'casual', 'maternity']


class WorkHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHours
        fields = '__all__'


class PerformanceReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceReview
        fields = '__all__'