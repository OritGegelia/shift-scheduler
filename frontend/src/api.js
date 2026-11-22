// Получили график

export async function fetchSchedule(year, month) {
  const response = await fetch(`/api/schedule/?year=${year}&month=${month}`)
  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`)
  }
  return response.json()
}

// Изменение смены

export async function updateAssignment(employeeId, date, shiftTypeId) {
  const response = await fetch('/api/assignments/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employee: employeeId,
      date: date,
      shift_type: shiftTypeId,
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || `Ошибка сервера: ${response.status}`)
  }
  return body
}