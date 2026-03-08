export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

export function getSunSign(birthdate: string): string {
  const date = new Date(birthdate)
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()

  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Aries"
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Taurus"
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gemini"
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Cancer"
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Leo"
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Virgo"
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Libra"
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Scorpio"
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagittarius"
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricorn"
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Aquarius"
  return "Pisces"
}
