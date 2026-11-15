import calendar
from datetime import date

from django.core.management.base import BaseCommand

from schedule.models import Assignment, Employee, ShiftType


class Command(BaseCommand):
    help = "Заполняет тестовый график на месяц"

    def add_arguments(self, parser):
        # параметры, которые передаются в командной строке
        parser.add_argument("year", type=int)
        parser.add_argument("month", type=int)

    def handle(self, *args, **options):
        year = options["year"]
        month = options["month"]
        days_in_month = calendar.monthrange(year, month)[1]  # сколько дней в месяце

        # достаём из таблицы два типа смены по коду
        workday = ShiftType.objects.get(shift_code="4")
        dayoff = ShiftType.objects.get(shift_code="В")

        employees = Employee.objects.filter(is_active=True)

        cells = []  # здесь соберём ячейки в памяти
        for employee in employees:
            for day in range(1, days_in_month + 1):
                d = date(year, month, day)
                # суббота и воскресенье это 5 и 6
                shift = dayoff if d.weekday() >= 5 else workday
                cells.append(Assignment(employee=employee, date=d, shift_type=shift))

        # записываем все ячейки в базу одним запросом
        Assignment.objects.bulk_create(cells, ignore_conflicts=True)
        self.stdout.write(f"Обработано ячеек: {len(cells)}")