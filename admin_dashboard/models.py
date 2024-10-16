from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Employee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    employees = models.ManyToManyField(Employee, related_name='projects')

    def __str__(self):
        return self.name


class TimeEntry(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='time_entries')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='time_entries')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.employee} - {self.project} ({self.start_time} to {self.end_time})"


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('awaiting_approval', 'Awaiting Approval'),
        ('extension_approved', 'Extension Approved'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_tasks', default=1)

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    LEAVE_TYPES = [
        ('ANNUAL', 'Annual Leave'),
        ('SICK', 'Sick Leave'),
        ('CASUAL', 'Casual Leave'),
        ('MATERNITY', 'Maternity Leave'),
    ]

    employee_name = models.CharField(max_length=100)
    employee_email = models.EmailField(max_length=100)
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, default='PENDING')
    
    # ForeignKey to User model
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin_leaverequests")

    def __str__(self):
        return f"{self.employee_name} - {self.leave_type}"


class ClockInRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_clockinrecords')
    time_clocked_in = models.DateTimeField(default=timezone.now)
    time_clocked_out = models.DateTimeField(null=True, blank=True)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    extra_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return f'{self.user.username} - {self.time_clocked_in.strftime("%Y-%m-%d %H:%M:%S")}'

    def save(self, *args, **kwargs):
        if self.time_clocked_out:
            worked_duration = (self.time_clocked_out - self.time_clocked_in).total_seconds() / 3600
            self.hours_worked = round(worked_duration, 2)
        super().save(*args, **kwargs)

    @staticmethod
    def get_today_hours(user):
        today = timezone.now().date()
        clock_in_record = ClockInRecord.objects.filter(user=user, time_clocked_in__date=today).last()
        if clock_in_record:
            if clock_in_record.time_clocked_out is None:
                current_time = timezone.now()
                worked_duration = (current_time - clock_in_record.time_clocked_in).total_seconds() / 3600
                return round(worked_duration, 2)
            else:
                return clock_in_record.hours_worked
        else:
            return 0


class LeaveBalance(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_leavebalance')
    annual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    sick = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    casual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    maternity = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return f'{self.user.username} Leave Balance'
