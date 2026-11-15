from django.db import models

# Пачка параметров для choices

class DutyKind(models.TextChoices):
    DAY = "day", "Дневное дежурство"
    NIGHT_START = "night_start", "Начало ночного"
    NIGHT_END = "night_end", "Конец ночного"
    REGULAR = "regular", "Не дежурство"
    REGULAR_SHORT = "regular_short", "Не дежурство сокращенное"
    DAYOFF = "dayoff", "Выходной"
    VACATION = "vacation", "Отпуск"
    DAYOFF_VACATION = "dayoff_vacation", "Выходной в отпуске"

# Моделька смен. Идентификатор, код (отобразится в таблице), имя (для простоты восприятия в админке), тип - для подсчета людей, количестов часов для подсчета года

class ShiftType(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True)
    shift_code = models.CharField(max_length=5, unique=True) 
    shift_name = models.CharField(max_length=50)
    duty_kind = models.CharField(max_length=20, choices=DutyKind.choices, default=DutyKind.REGULAR)
    hours = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.shift_code

# Моделька сотрудника

# Что хотим: ФИО, флаг дежурного, флаг активности, место в таблице

class Employee(models.Model):
    full_name = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    is_regular_duty = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.full_name
    
    class Meta:
        ordering = ["sort_order", "full_name"]


# Моделька уже таблицы. Один инстанс - одна ячейка
# Что хотим: ФИО сотрудника, дата, тип смены

class Assignment(models.Model): 
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    shift_type = models.ForeignKey(ShiftType, on_delete=models.PROTECT)
    date = models.DateField()

    class Meta:
        constraints = [
        models.UniqueConstraint(fields=["employee", "date"], name="unique_employee_date"),
    ]
