export default function getBangkokISOString() {
  const now = new Date()
  const bangkok = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  return bangkok.toISOString().slice(0, 19)
}