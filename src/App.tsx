import { type FormEvent, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [presentationTitle, setPresentationTitle] = useState('')
  const [slidesLength, setSlidesLength] = useState<number | ''>('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBaseUrl = useMemo(() => {
    const val = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
    return val && val.length > 0 ? val : 'http://localhost:8080'
  }, [])

  const canSubmit = useMemo(() => {
    const num = typeof slidesLength === 'number' ? slidesLength : NaN
    return (
      presentationTitle.trim().length > 0 &&
      Number.isFinite(num) &&
      num >= 1 &&
      num <= 20 &&
      !loading
    )
  }, [presentationTitle, slidesLength, loading])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const num = typeof slidesLength === 'number' ? slidesLength : NaN
    if (!presentationTitle.trim()) {
      setError('Будь ласка, введіть назву презентації')
      return
    }
    if (!Number.isFinite(num) || num < 1 || num > 20) {
      setError('Кількість слайдів має бути числом від 1 до 20')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${apiBaseUrl}/presentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentationTitle: presentationTitle.trim(),
          slidesLength: String(num),
          additionalContext: additionalContext.trim(),
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Помилка запиту: ${res.status}`)
      }

      setMessage('Презентацію успішно згенеровано!')
      setPresentationTitle('')
      setSlidesLength('')
      setAdditionalContext('')
    } catch (err: any) {
      setError(err?.message || 'Щось пішло не так. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card form-card">
        <h1 className="title">Генерація презентації</h1>
        <p className="subtitle">Заповніть форму нижче, щоб згенерувати презентацію</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Назва презентації</label>
            <input
              id="title"
              type="text"
              placeholder="Наприклад: ООП в Java"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="slides">Кількість слайдів (макс. 20)</label>
            <input
              id="slides"
              type="number"
              min={1}
              max={20}
              placeholder="10"
              value={slidesLength}
              onChange={(e) => {
                const v = e.target.value
                setSlidesLength(v === '' ? '' : Math.max(1, Math.min(20, Number(v))))
              }}
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="context">Додатковий контекст</label>
            <textarea
              id="context"
              placeholder="Опишіть аудиторію, акценти, побажання тощо (необов'язково)"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}

          <button type="submit" className="primary" disabled={!canSubmit}>
            {loading ? (
              <span className="btn-content">
                <span className="spinner small" aria-hidden /> Генерується...
              </span>
            ) : (
              'Генерувати'
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="overlay" aria-live="polite" aria-busy="true">
          <div className="spinner" />
          <div className="loader-text">Генеруємо презентацію…</div>
        </div>
      )}
    </div>
  )
}

export default App
