import assert from "node:assert/strict"
import test from "node:test"
import { availabilityError } from "../src/lib/availability"

const base = { bookingLeadHours: 2, workingDays: [1,2,3,4,5], workStart: "08:00", workEnd: "18:00", unavailableDates: [] as string[] }
test("rejects bookings without enough notice", () => { assert.match(availabilityError(base, new Date(Date.now() + 30 * 60 * 1000)) ?? "", /notice/) })
test("rejects a blocked date", () => { const date = new Date(Date.now() + 14 * 86400000); const profile = { ...base, workingDays: [0,1,2,3,4,5,6], unavailableDates: [date.toISOString().slice(0,10)] }; assert.match(availabilityError(profile, date) ?? "", /unavailable/) })
