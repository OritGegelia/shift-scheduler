from django.contrib import admin
from .models import ShiftType
from .models import Employee
from .models import Assignment

admin.site.register(ShiftType)
admin.site.register(Employee)
admin.site.register(Assignment)