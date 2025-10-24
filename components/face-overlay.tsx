"use client"

export interface FaceOverlayProps {
  faces: any[]
  showBoxes: boolean
  showAttributes: boolean
  showDetails: boolean
}

export function FaceOverlay({ faces, showBoxes, showAttributes, showDetails }: FaceOverlayProps) {
  return (
    <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
      {faces.map((face, idx) => {
        const { top, left, width, height } = face.boundingBox
        const x = left * 100
        const y = top * 100
        const w = width * 100
        const h = height * 100

        return (
          <g key={idx}>
            {/* Bounding Box */}
            {showBoxes && (
              <rect
                x={`${x}%`}
                y={`${y}%`}
                width={`${w}%`}
                height={`${h}%`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              />
            )}

            {/* Attributes Label */}
            {(showAttributes || showDetails) && (
              <g>
                <rect
                  x={`${x}%`}
                  y={`${Math.max(0, y - 8)}%`}
                  width={`${Math.max(w, 15)}%`}
                  height="8%"
                  fill="#6366f1"
                  opacity="0.9"
                />
                <text
                  x={`${x + w / 2}%`}
                  y={`${Math.max(0, y - 2)}%`}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {face.gender} {face.ageRange.low}-{face.ageRange.high}
                </text>
              </g>
            )}

            {/* Emotion Label */}
            {showDetails && face.emotions && face.emotions.length > 0 && (
              <g>
                <rect
                  x={`${x}%`}
                  y={`${y + h}%`}
                  width={`${Math.max(w, 15)}%`}
                  height="6%"
                  fill="#8b5cf6"
                  opacity="0.9"
                />
                <text
                  x={`${x + w / 2}%`}
                  y={`${y + h + 4}%`}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {face.emotions[0].type}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
