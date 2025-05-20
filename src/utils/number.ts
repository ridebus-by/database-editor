export function declOfNum(n: number, titles: [string, string, string]) {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return titles[2]
  const mod10 = n % 10
  if (mod10 === 1) return titles[0]
  if (mod10 >= 2 && mod10 <= 4) return titles[1]
  return titles[2]
}