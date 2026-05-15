// ─── DualColorPicker ──────────────────────────────────────────────────────────
//
//  Two-tab color input:
//  Tab 0 → standard HTML color picker + hex text input
//  Tab 1 → upload an image, click a pixel to extract its hex color

import { useState, useCallback } from 'react'

interface DualColorPickerProps {
  value: string
  onChange: (hex: string) => void
  required?: boolean
  error?: string
}

export default function DualColorPicker({ value, onChange, required, error }: DualColorPickerProps) {
  const [activeTab, setActiveTab] = useState<0 | 1>(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isPicking, setIsPicking] = useState(false)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setUploadedImage(reader.result as string)
    reader.readAsDataURL(file)
    setIsPicking(false)
  }

  const extractColor = useCallback(
    (e: React.MouseEvent<HTMLImageElement>, finalPick: boolean) => {
      if (!uploadedImage || !isPicking) return

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const rect = (e.target as HTMLImageElement).getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) * (img.width / rect.width))
        const y = Math.floor((e.clientY - rect.top) * (img.height / rect.height))
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`

        if (finalPick) {
          onChange(hex)
          setIsPicking(false)
        } else {
          setHoveredColor(hex)
        }
      }
      img.src = uploadedImage
    },
    [uploadedImage, isPicking, onChange],
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Color Hex {required && <span className="text-[var(--danger)]">*</span>}
      </span>

      {/* Tabs */}
      <div className="flex rounded-[var(--radius)] overflow-hidden border border-[var(--border)]">
        {(['Color Picker', 'Pick from Image'] as const).map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(idx as 0 | 1)}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${activeTab === idx
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 0 — Color Picker */}
      {activeTab === 0 && (
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border-0 p-0.5 bg-transparent"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
            }}
            maxLength={7}
            placeholder="#000000"
            className="flex-1 px-3 py-2 text-sm font-mono rounded-[var(--radius)] border border-[var(--border)]
              bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
              uppercase"
          />
          {value && value.length === 7 && (
            <div
              className="w-10 h-10 rounded-[var(--radius)] border-2 border-[var(--border)] flex-shrink-0 shadow-sm"
              style={{ backgroundColor: value }}
            />
          )}
        </div>
      )}

      {/* Tab 1 — Pick from Image */}
      {activeTab === 1 && (
        <div className="flex flex-col gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          {/* Upload input */}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Upload image:</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3
                file:rounded-full file:border-0 file:text-xs file:font-medium
                file:bg-[var(--accent-soft)] file:text-[var(--accent)]
                hover:file:bg-[var(--accent)] hover:file:text-white"
            />
          </label>

          {uploadedImage && (
            <>
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPicking((v) => !v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
                    ${isPicking
                      ? 'bg-[var(--danger)] text-white border-[var(--danger)]'
                      : 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    }`}
                >
                  {isPicking ? '✕ Cancel' : '🎯 Pick Color'}
                </button>
                {hoveredColor && isPicking && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div
                      className="w-5 h-5 rounded border border-[var(--border)]"
                      style={{ backgroundColor: hoveredColor }}
                    />
                    <span className="font-mono">{hoveredColor}</span>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="relative inline-block max-w-full">
                <img
                  src={uploadedImage}
                  alt="Pick color from this"
                  onMouseMove={(e) => extractColor(e, false)}
                  onClick={(e) => extractColor(e, true)}
                  className="max-w-full max-h-80 rounded-[var(--radius)] border border-[var(--border)]"
                  style={{ cursor: isPicking ? 'crosshair' : 'default' }}
                  draggable={false}
                />
                {isPicking && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                    Click to pick a color
                  </div>
                )}
              </div>
            </>
          )}

          {/* Preview */}
          {value && value.length === 7 && (
            <div className="flex items-center gap-3 pt-1">
              <div
                className="w-8 h-8 rounded border border-[var(--border)] shadow-sm"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs font-mono text-[var(--text-secondary)]">{value}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}