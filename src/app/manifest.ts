import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regulated",
    short_name: "Regulated",
    description: "A personal growth platform for the woman who has everything — and still wants more.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ee",
    theme_color: "#1c1917",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
