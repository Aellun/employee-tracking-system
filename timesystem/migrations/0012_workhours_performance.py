# Generated by Django 4.2.2 on 2024-10-22 20:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        (
            "timesystem",
            "0011_remove_leaverequest_employee_id_leaverequest_user_and_more",
        ),
    ]

    operations = [
        migrations.CreateModel(
            name="WorkHours",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("clock_in_time", models.DateTimeField()),
                ("clock_out_time", models.DateTimeField(blank=True, null=True)),
                (
                    "total_hours",
                    models.DecimalField(decimal_places=2, default=0.0, max_digits=5),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Performance",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("tasks_completed", models.IntegerField(default=0)),
                ("tasks_assigned", models.IntegerField(default=0)),
                ("efficiency_rate", models.FloatField(default=0.0)),
                ("review_date", models.DateField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]