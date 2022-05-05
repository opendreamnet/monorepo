export type SpeedometerFunc = (input?: number) => number

export default function(windowSize?: number): SpeedometerFunc {
  const size = windowSize || 10
  let startTime = new Date()
  const lastTenValues: number[] = []
  const lastTenDist: number[] = []

  return function(input?: number): number {
    const inputLength = input || 0
    const endDate = new Date()
    let dist = (endDate.getTime() - startTime.getTime())
    if (dist === 0) dist = 1
    startTime = new Date(endDate)

    lastTenDist.push(dist)
    lastTenValues.push(inputLength)

    if (lastTenValues.length > size)lastTenValues.shift()

    const sum = lastTenValues.reduce((a, b) => a + b, 0)
    const avg = lastTenDist.reduce((a, b) => a + b, 0)

    return lastTenValues.length < size ? inputLength : (sum / lastTenValues.length) / (avg / 1000)
  }
}