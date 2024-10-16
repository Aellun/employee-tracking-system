# Generated by Django 4.2.2 on 2024-10-15 13:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("timesystem", "0009_leaverequest"),
    ]

    operations = [
        migrations.CreateModel(
            name="LeaveBalance",
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
                (
                    "annual",
                    models.DecimalField(decimal_places=2, default=0, max_digits=5),
                ),
                (
                    "sick",
                    models.DecimalField(decimal_places=2, default=0, max_digits=5),
                ),
                (
                    "casual",
                    models.DecimalField(decimal_places=2, default=0, max_digits=5),
                ),
                (
                    "maternity",
                    models.DecimalField(decimal_places=2, default=0, max_digits=5),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]