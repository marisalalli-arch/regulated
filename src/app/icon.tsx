import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
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
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "#f5f2ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 200,
              fontFamily: "serif",
              color: "#1c1917",
              fontWeight: 300,
              lineHeight: 1,
              marginTop: -8,
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
