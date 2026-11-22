import { useEffect, useState } from 'react'
import { fetchSchedule, updateAssignment } from './api'
import ScheduleGrid from './components/ScheduleGrid'
import './App.css'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export default function App() {
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(11)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setSaveError(null)
    fetchSchedule(year, month)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [year, month])

  function shiftMonth(delta) {
    const index = year * 12 + (month - 1) + delta
    setYear(Math.floor(index / 12))
    setMonth((index % 12) + 1)
  }

    async function handleCellChange(employeeId, day, shiftTypeId) {
    setSaveError(null)
    try {
      await updateAssignment(employeeId, day, shiftTypeId)
      const fresh = await fetchSchedule(year, month)
      setData(fresh)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  return (
    <div className="page">
      <header className="toolbar">
        <button onClick={() => shiftMonth(-1)}>←</button>
        <h1>{MONTH_NAMES[month - 1]} {year}</h1>
        <button onClick={() => shiftMonth(1)}>→</button>
      </header>

      {error && <p className="error">{error}</p>}
      {saveError && <p className="error">Не удалось сохранить: {saveError}</p>}
      {!data && !error && <p>Загрузка…</p>}
      {data && (
        <ScheduleGrid
          data={data}
          onCellChange={handleCellChange}
          monthTitle={`${MONTH_NAMES[month - 1].toLowerCase()} ${year}`}
        />
      )}
    </div>
  )
}