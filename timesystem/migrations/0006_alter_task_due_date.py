# Generated by Django 4.2.2 on 2024-10-10 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("timesystem", "0005_alter_task_due_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="task",
            name="due_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
