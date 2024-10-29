# Generated by Django 4.2.2 on 2024-10-26 15:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("timesystem", "0015_task_project"),
    ]

    operations = [
        migrations.AlterField(
            model_name="task",
            name="project",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="tasks",
                to="timesystem.project",
            ),
        ),
    ]