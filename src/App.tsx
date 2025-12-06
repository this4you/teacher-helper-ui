import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [presentationTitle, setPresentationTitle] = useState('')
  const [slidesLength, setSlidesLength] = useState<number | ''>('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const BASE_URL = useMemo(() => {
    const env = (import.meta as any).env || {}
    return env.VITE_API_BASE_URL || 'http://localhost:8080'
  }, [])

  const validate = (): string | null => {
    if (!presentationTitle.trim()) return 'Введіть назву презентації.'
    if (slidesLength === '' || isNaN(Number(slidesLength))) return 'Вкажіть кількість слайдів.'
    const n = Number(slidesLength)
    if (n < 1) return 'Мінімум 1 слайд.'
    if (n > 20) return 'Максимум 20 слайдів.'
    return null
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    try {
      setLoading(true)
      const body = {
        presentationTitle: presentationTitle.trim(),
        slidesLength: String(slidesLength),
        additionalContext: additionalContext.trim(),
      }
      const res = await fetch(`${BASE_URL}/presentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Помилка ${res.status}`)
      }
      setSuccess('Презентацію успішно надіслано на генерацію!')
    } catch (err: any) {
      setError(err?.message || 'Сталася невідома помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="card modern">
        <h1>Генератор презентацій</h1>
        <p className="subtitle">Створіть презентацію за назвою, кількістю слайдів та контекстом</p>
        <form onSubmit={onSubmit} className="form">
          <div className="form-row">
            <label htmlFor="title">Назва презентації</label>
            <input
              id="title"
              type="text"
              placeholder="Напр., ООП в Java"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="slides">Кількість слайдів (1–20)</label>
            <input
              id="slides"
              type="number"
              min={1}
              max={20}
              placeholder="10"
              value={slidesLength}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') setSlidesLength('')
                else setSlidesLength(Number(val))
              }}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="context">Додатковий контекст (необов’язково)</label>
            <textarea
              id="context"
              placeholder="Короткий опис, цільова аудиторія, вимоги тощо..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={loading}
              rows={5}
            />
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? (
              <span className="btn-loader">
                <span className="spinner" aria-hidden /> Генерується...
              </span>
            ) : (
              'Генерувати'
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="overlay" role="status" aria-live="polite">
          <div className="loader" />
          <div className="loader-text">Генеруємо презентацію…</div>
        </div>
      )}

      <footer className="footer">API: {BASE_URL}/presentation</footer>
    </div>
  )
}

export default App
