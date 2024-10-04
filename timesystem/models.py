from django.db import models
from django.contrib.auth.models import User

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
    clock_in_time = models.DateTimeField()
    clock_out_time = models.DateTimeField(null=True, blank=True)  # clock out is optional initially
    total_hours = models.FloatField(default=0)
    extra_hours = models.FloatField(default=0)
    job_name = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

class Break(models.Model):
    clock_in_record = models.ForeignKey(ClockInRecord, on_delete=models.CASCADE, related_name="breaks")
    break_type = models.CharField(max_length=50)
    break_start = models.DateTimeField()
    break_end = models.DateTimeField(null=True, blank=True)  # end time is optional initially
    break_notes = models.TextField()