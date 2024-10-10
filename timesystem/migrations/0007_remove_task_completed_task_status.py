# Generated by Django 4.2.2 on 2024-10-10 13:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("timesystem", "0006_alter_task_due_date"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="task",
            name="completed",
        ),
        migrations.AddField(
            model_name="task",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("completed", "Completed"),
                    ("In_Progress", "In_Progress"),
                ],
                default="pending",
                max_length=50,
            ),
        ),
    ]
