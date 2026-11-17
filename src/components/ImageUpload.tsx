import { useState, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { uploadImage } from '../lib/data'
import { Field } from './ui'

export function ImageUpload({
  label,
  value,
  onChange,
  folder,
  hint,
  previewClass = 'h-32 w-full object-cover',
}: {
  label: string
  value: string
  onChange: (url: string) => void
  folder: 'productos' | 'marca'
  hint?: string
  previewClass?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      onChange(await uploadImage(file, folder))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div>
      <Field label={label} hint={hint}>
        <div className="space-y-2">
          {value && (
            <img
              src={value}
              alt="Vista previa"
              className={`${previewClass} rounded-lg border border-slate-200 bg-slate-100`}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="btn-ghost cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              {uploading ? 'Subiendo…' : 'Elegir imagen'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
            </label>
            {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            {value && (
              <button
                type="button"
                className="btn-ghost px-2.5 py-1.5 text-xs"
                onClick={() => onChange('')}
              >
                <Trash2 className="h-3.5 w-3.5" /> Quitar
              </button>
            )}
          </div>
          <input
            className="input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="O pegá una URL de imagen…"
          />
        </div>
      </Field>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
