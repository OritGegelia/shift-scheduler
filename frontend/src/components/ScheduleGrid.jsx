import { useState } from 'react'

const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

// Требуемое число дежурных в каждой группе. Бэкенд это число пока не отдаёт.
const REQUIRED = 2

const COVERAGE_ROWS = [
  { key: 'day', label: 'Кол-во в см. 1' },
  { key: 'night_start', label: 'Кол-во в ночную смену (2)' },
  { key: 'night_end', label: 'Кол-во в см. 3' },
]

function dayInfo(isoDate) {
  const date = new Date(isoDate + 'T00:00:00')
  const weekday = date.getDay()
  return {
    number: date.getDate(),
    weekdayName: WEEKDAYS[weekday],
    isWeekend: weekday === 0 || weekday === 6,
  }
}

function coverageClass(count) {
  if (count === REQUIRED) return 'cov-ok'
  if (count < REQUIRED) return 'cov-low'
  return 'cov-high'
}

export default function ScheduleGrid({ data, onCellChange, monthTitle }) {
  const [editing, setEditing] = useState(null)

  const shiftTypesById = Object.fromEntries(
    data.shift_types.map((type) => [type.id, type])
  )

  const visibleEmployees = data.employees.filter(
    (employee) => Object.keys(employee.cells).length > 0
  )

  function handleSelect(employee, day, newTypeId) {
    setEditing(null)
    if (newTypeId !== employee.cells[day]) {
      onCellChange(employee.id, day, newTypeId)
    }
  }

  return (
    <div className="grid-wrapper">
      <table className="grid">
        <thead>
          <tr>
            <th className="name-col" rowSpan={2}>ФИО</th>
            <th className="hours-col" rowSpan={2}>Факт</th>
            <th className="month-title" colSpan={data.days.length}>
              {monthTitle}
            </th>
          </tr>
          <tr>
            {data.days.map((day) => {
              const info = dayInfo(day)
              return (
                <th key={day} className={info.isWeekend ? 'weekend' : ''}>
                  <div>{info.number}</div>
                  <div className="weekday">{info.weekdayName}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {visibleEmployees.map((employee) => (
            <tr key={employee.id}>
              <td className="name-col">{employee.full_name}</td>
              <td className="hours-col">{employee.total_hours}</td>
              {data.days.map((day) => {
                const typeId = employee.cells[day]
                const type = shiftTypesById[typeId]
                const isEditing =
                  editing !== null &&
                  editing.employeeId === employee.id &&
                  editing.day === day

                if (isEditing) {
                  return (
                    <td key={day} className="cell editing">
                      <select
                        autoFocus
                        value={typeId}
                        onChange={(e) =>
                          handleSelect(employee, day, Number(e.target.value))
                        }
                        onBlur={() => setEditing(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setEditing(null)
                        }}
                      >
                        {data.shift_types.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.code} — {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  )
                }

                return (
                  <td
                    key={day}
                    className={type ? `cell clickable kind-${type.kind}` : 'cell'}
                    title={type ? type.name : ''}
                    onClick={() => setEditing({ employeeId: employee.id, day })}
                  >
                    {type ? type.code : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {COVERAGE_ROWS.map((row) => (
            <tr key={row.key}>
              <td className="name-col">{row.label}</td>
              <td className="hours-col"></td>
              {data.days.map((day) => {
                const count = data.coverage?.[day]?.[row.key] ?? 0
                return (
                  <td key={day} className={`cell ${coverageClass(count)}`}>
                    {count}
                  </td>
                )
              })}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}