from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()

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

class ClockInRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    time_clocked_in = models.DateTimeField(default=timezone.now)
    time_clocked_out = models.DateTimeField(null=True, blank=True)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    extra_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return f'{self.user.username} - {self.time_clocked_in}'

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