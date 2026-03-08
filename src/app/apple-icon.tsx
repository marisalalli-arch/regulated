import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1917",
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: "50%",
            background: "#f5f2ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontFamily: "serif",
              color: "#1c1917",
              fontWeight: 300,
              lineHeight: 1,
              marginTop: -4,
            }}
          >
            r
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
