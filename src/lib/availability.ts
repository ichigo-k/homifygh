export type AvailabilityProfile = {
  bookingLeadHours: number
  workingDays: number[]
  workStart: string
  workEnd: string
  unavailableDates: string[]
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number)
  return hours * 60 + mins
}

export function availabilityError(profile: AvailabilityProfile, scheduledAt: Date) {
  if (scheduledAt.getTime() < Date.now() + profile.bookingLeadHours * 60 * 60 * 1000) {
    return `This provider requires at least ${profile.bookingLeadHours} hours notice.`
  }
  if (!profile.workingDays.includes(scheduledAt.getDay())) return "This provider does not work on the selected day."
  const dateKey = scheduledAt.toISOString().slice(0, 10)
  if (profile.unavailableDates.includes(dateKey)) return "This provider is unavailable on the selected date."
  const selectedMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes()
  if (selectedMinutes < minutes(profile.workStart) || selectedMinutes >= minutes(profile.workEnd)) {
    return `Choose a time between ${profile.workStart} and ${profile.workEnd}.`
  }
  return null
}
