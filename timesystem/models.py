from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

class Employee(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

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
    notes = models.TextField(null=True, blank=True)  # For extension or status change notes
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, default=1)

    def __str__(self):
        return self.name

class TimeEntry(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    is_billable = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.employee} - {self.task}"

    def clean(self):
        if self.end_time and self.start_time and self.end_time < self.start_time:
            raise ValidationError("End time must be after start time.")

class ClockInRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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
        # Get the latest clock-in record for today
        clock_in_record = ClockInRecord.objects.filter(user=user, time_clocked_in__date=today).last()

        if clock_in_record:
            if clock_in_record.time_clocked_out is None:
                # User is currently clocked in, calculate worked hours from clock-in time to now
                current_time = timezone.now()
                worked_duration = (current_time - clock_in_record.time_clocked_in).total_seconds() / 3600
                return round(worked_duration, 2)
            else:
                # User has clocked out, return the hours worked from the record
                return clock_in_record.hours_worked
        else:
            # No clock-in record for today
            return 0

class JobRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_name = models.CharField(max_length=100)
    clock_in_record = models.ForeignKey(ClockInRecord, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.job_name} by {self.user.username}'

class BreakRecord(models.Model):
    BREAK_CHOICES = (
        ('tea', 'Tea Break'),
        ('lunch', 'Lunch Break'),
    )
    clock_in_record = models.ForeignKey(ClockInRecord, on_delete=models.CASCADE)
    break_type = models.CharField(max_length=20, choices=BREAK_CHOICES)
    break_notes = models.TextField(blank=True, null=True)
    time_started = models.DateTimeField(default=timezone.now)
    time_ended = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.break_type} by {self.clock_in_record.user.username}'

    def clean(self):
        if self.time_ended and self.time_started and self.time_ended < self.time_started:
            raise ValidationError("End time must be after start time for the break.")

    def duration(self):
        """Calculate the duration of the break in hours."""
        if self.time_ended and self.time_started:
            duration = (self.time_ended - self.time_started).total_seconds() / 3600
            return round(duration, 2)
        return 0
