from rest_framework.decorators import api_view
from rest_framework.response import Response
import calendar
from .models import ShiftType, Employee, Assignment
from datetime import date
from django.core.exceptions import ValidationError

# Получение базовой сетки без смен

@api_view(['GET'])
def schedule_view(request):

    try:
        year = int(request.query_params.get("year"))
        month = int(request.query_params.get("month"))
    except (TypeError, ValueError):
        return Response({"error": "Нужны числовые параметры year и month"}, status=400)

    if not (2000 <= year <= 2100 and 1 <= month <= 12):
        return Response({"error": "year от 2000 до 2100, month от 1 до 12"}, status=400)
    
    days_in_month = calendar.monthrange(year, month)[1]

    assignments = Assignment.objects.filter(date__year=year, date__month=month)

    days = []
    shift_types = []
    employees = []

    cells_by_employee = {}

    for employee in Employee.objects.all():
        cells_by_employee[employee.id] = {}

    for a in assignments:
        cells_by_employee[a.employee_id][a.date.isoformat()] = a.shift_type_id

    for day in range(1, days_in_month + 1):
        days.append(date(year, month, day))

    for shift in ShiftType.objects.all():
        shift_types.append({
            "id": shift.id,
            "code": shift.shift_code,
            "name": shift.shift_name,
            "hours": shift.hours,
            "kind": shift.duty_kind,
        })

    for employee in Employee.objects.all():
        employees.append({
            "full_name": employee.full_name,
            "is_active": employee.is_active,
            "is_regular_duty": employee.is_regular_duty,
            "sort_order": employee.sort_order,
            "id": employee.id,
            "cells": cells_by_employee[employee.id]
        })

    return Response({
        "year": year, 
        "month": month, 
        "days_in_month": days_in_month,
        "days": days,
        "shift_types": shift_types,
        "employees": employees,
        "assigments_count": assignments.count()})

@api_view(['PATCH'])
def assignment_view(request):
    employee_id = request.data.get('employee')
    date_str = request.data.get('date')
    shift_type_id = request.data.get('shift_type')

    if employee_id is None or date_str is None or shift_type_id is None:
        return Response(
            {"error": "Нужны поля employee, date и shift_type"},
            status=400,
        )
    
    try:
        new_type = ShiftType.objects.get(id=shift_type_id)
    except (ShiftType.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Такого типа смены нет"}, status=400)

    try:
        assignment = Assignment.objects.get(employee_id=employee_id, date=date_str)
    except Assignment.DoesNotExist:
        return Response({"error": "Ячейка не найдена"}, status=404)
    except (ValueError, TypeError, ValidationError):
        return Response({"error": "employee должен быть числом, date датой ГГГГ-ММ-ДД"}, status=400)

    assignment.shift_type = new_type
    assignment.save()

    return Response({
        "employee": assignment.employee_id,
        "date": assignment.date.isoformat(),
        "shift_type": assignment.shift_type_id,
    })