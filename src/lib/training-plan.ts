/**
 * The 12-week fat-loss + muscle-build plan, encoded as constants.
 *
 * The plan is hard-coded (rather than stored in the DB) because it doesn't
 * change between users right now. If we add more plans later, we move this
 * shape to the DB and key everything off planSlug.
 */

export type Phase = "Foundation" | "Build" | "Push" | "Peak"

export type Exercise = {
  key: string
  name: string
  equipment: string
  cue: string
}

export type Workout = {
  key: "A" | "B" | "C"
  name: string
  focus: string
  warmup: string
  exercises: Exercise[]
}

export type CardioOption = {
  key: string
  name: string
  howTo: string
  cadence: string
}

export type PhaseConfig = {
  name: Phase
  weeks: number[] // e.g. [1, 2, 3]
  focus: string
  liftTarget: string // e.g. "3 sets x 10-12 reps"
  cardio: string
}

// ----- The 4 phases -----
export const PHASES: PhaseConfig[] = [
  {
    name: "Foundation",
    weeks: [1, 2, 3],
    focus: "Learn the movements, build the habit. Don't go heavy yet.",
    liftTarget: "3 sets × 10-12 reps",
    cardio: "2× 25-min walks",
  },
  {
    name: "Build",
    weeks: [4, 5, 6],
    focus: "Add weight. Workouts feel hard but doable.",
    liftTarget: "3 sets × 10 + 1 burnout set",
    cardio: "2× 30-min walks + 1× 15-min incline intervals",
  },
  {
    name: "Push",
    weeks: [7, 8, 9],
    focus: "Heavier dumbbells, slower tempos, more challenging variations.",
    liftTarget: "4 sets × 8-10 reps, 3-second lowering tempo",
    cardio: "2× 35-min walks + 1× 20-min incline intervals",
  },
  {
    name: "Peak",
    weeks: [10, 11, 12],
    focus: "Test what you've built. Mix of heavier sets and circuits.",
    liftTarget: "4 sets × 6-12 reps + finishers",
    cardio: "2× 40-min walks + 1× 20-min intervals",
  },
]

// ----- The 3 workouts (rotated through the week) -----
export const WORKOUTS: Workout[] = [
  {
    key: "A",
    name: "Squat-Focused Full Body",
    focus: "Lower body push, with upper-body pull and shoulder work",
    warmup: "5 min easy treadmill walk + 10 bodyweight squats + 10 arm circles.",
    exercises: [
      { key: "goblet_squat", name: "Goblet Squat", equipment: "Dumbbell",
        cue: "Hold DB at chest. Sit back, knees track over toes, chest up." },
      { key: "trx_row", name: "TRX Row", equipment: "TRX",
        cue: "Body straight as a plank. Pull elbows back, squeeze shoulder blades." },
      { key: "db_reverse_lunge", name: "DB Reverse Lunge", equipment: "Dumbbells",
        cue: "Step back, drop straight down. Front knee stacked over ankle." },
      { key: "db_shoulder_press", name: "DB Shoulder Press", equipment: "Dumbbells",
        cue: "Seated or standing. Press straight up; don't arch lower back." },
      { key: "bosu_plank", name: "BOSU Plank", equipment: "BOSU (flat side up)",
        cue: "Forearms on the dome. Squeeze glutes, breathe steadily." },
      { key: "incline_walk_finisher", name: "Incline Walk Finisher", equipment: "Treadmill",
        cue: "8-10 min at incline 6-8%, walking pace 3.0-3.5 mph." },
    ],
  },
  {
    key: "B",
    name: "Hinge-Focused Full Body",
    focus: "Posterior chain (hamstrings/glutes), with chest press and row",
    warmup: "5 min walk + 10 glute bridges + 10 cat-cows.",
    exercises: [
      { key: "db_rdl", name: "DB Romanian Deadlift", equipment: "Dumbbells",
        cue: "Soft knees. Push hips back, DBs slide down thighs. Feel hamstrings." },
      { key: "db_bench_press", name: "DB Bench/Floor Press", equipment: "Dumbbells",
        cue: "Press up, lower with control to chest level." },
      { key: "db_hip_thrust", name: "DB Hip Thrust", equipment: "Dumbbell",
        cue: "Shoulders on bench/couch, DB on hips. Drive through heels." },
      { key: "single_arm_row", name: "Single-Arm DB Row", equipment: "Dumbbell",
        cue: "Hand on bench. Pull DB to hip, squeeze. No twisting torso." },
      { key: "bosu_pushup", name: "BOSU Push-Up", equipment: "BOSU (dome down)",
        cue: "Knees down to start if needed. Lower with control." },
      { key: "recovery_walk", name: "Recovery Walk", equipment: "Treadmill",
        cue: "8-10 min, flat or 3% incline, easy pace 2.8-3.2 mph." },
    ],
  },
  {
    key: "C",
    name: "Push/Pull Full Body",
    focus: "Upper-body push and pull, plus single-leg strength",
    warmup: "5 min walk + 10 TRX pull-aparts + 10 bodyweight squats.",
    exercises: [
      { key: "trx_squat", name: "TRX Squat", equipment: "TRX",
        cue: "Hold straps for balance. Sit back deep, drive through heels." },
      { key: "db_chest_supported_row", name: "DB Chest-Supported Row", equipment: "Dumbbells + bench",
        cue: "Chest on bench. Pull DBs to ribs, squeeze." },
      { key: "db_step_up_bosu", name: "DB Step-Up onto BOSU", equipment: "Dumbbells + BOSU",
        cue: "Step on, stand tall, step back down. Slow + controlled." },
      { key: "db_curl_press", name: "DB Curl + Press", equipment: "Dumbbells",
        cue: "Curl up, then press overhead. Reverse on the way down." },
      { key: "trx_pike_plank", name: "TRX Pike or Plank", equipment: "TRX",
        cue: "Feet in straps. Pike: pull hips up. Plank: hold steady." },
      { key: "incline_intervals", name: "Incline Walking Intervals (Phase 2+)", equipment: "Treadmill",
        cue: "1 min @ 8-12% incline 3.0 mph / 2 min easy. 4-5 rounds. No running." },
    ],
  },
]

// ----- Cardio options (logged separately from lifts) -----
export const CARDIO_OPTIONS: CardioOption[] = [
  { key: "walk_liss", name: "Steady Walk (LISS)",
    howTo: "Tread 3.0-3.5 mph, incline 5-8%. Talk in short sentences.",
    cadence: "2-3x/wk, 25-40 min" },
  { key: "walk_power", name: "Power Walk",
    howTo: "Tread 3.5-4.0 mph (quick walk, not jog), flat or incline 2-3%.",
    cadence: "Mix in as you feel ready" },
  { key: "walk_intervals", name: "Incline Walking Intervals",
    howTo: "1 min @ 8-12% incline 3.0 mph / 2 min recovery. 4-6 rounds. No running.",
    cadence: "1x/wk Phase 2+" },
  { key: "row_steady", name: "Steady Row",
    howTo: "24-26 strokes/min. Legs → back → arms on the drive. ~5-6/10 effort.",
    cadence: "1-2x/wk, 15-25 min" },
  { key: "row_intervals", name: "Rowing Intervals",
    howTo: "250m hard / 1 min easy x 6-8 rounds. Or 1 min on / 1 min off for 15 min.",
    cadence: "Alt with incline intervals" },
  { key: "peloton", name: "Peloton Class",
    howTo: "Walk/Hike with Kirsten/Matty/Ash, or Sims 60 with Jess (sub walks for runs).",
    cadence: "Replace any walk session" },
]

// ----- Default weekly schedule (M/W/F lifts, walks/rows on other days) -----
export const WEEKLY_SCHEDULE: { dayIndex: number; dayLabel: string; suggested: string; workoutKey: string | null }[] = [
  { dayIndex: 1, dayLabel: "Mon", suggested: "Workout A — Squat-Focused", workoutKey: "A" },
  { dayIndex: 2, dayLabel: "Tue", suggested: "Walk (treadmill or outside)", workoutKey: "walk" },
  { dayIndex: 3, dayLabel: "Wed", suggested: "Workout B — Hinge-Focused", workoutKey: "B" },
  { dayIndex: 4, dayLabel: "Thu", suggested: "Walk OR rest", workoutKey: "walk" },
  { dayIndex: 5, dayLabel: "Fri", suggested: "Workout C — Push/Pull", workoutKey: "C" },
  { dayIndex: 6, dayLabel: "Sat", suggested: "Walk + intervals (Phase 2+) OR row", workoutKey: "walk" },
  { dayIndex: 0, dayLabel: "Sun", suggested: "Rest. Plan meals. Prep food.", workoutKey: null },
]

// ----- Helpers -----

/** Format a Date as YYYY-MM-DD in the user's local timezone. */
export function dateToYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD back into a Date at local midnight. */
export function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Compute which plan week (1-12) "today" falls in, given a startDate (YMD). */
export function computeWeekNumber(startDateYMD: string, todayYMD: string = dateToYMD(new Date())): number {
  const start = ymdToDate(startDateYMD)
  const today = ymdToDate(todayYMD)
  const ms = today.getTime() - start.getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  // Week 1 starts on day 0
  const week = Math.floor(days / 7) + 1
  if (week < 1) return 1
  if (week > 12) return 12
  return week
}

export function phaseForWeek(weekNumber: number): PhaseConfig {
  return PHASES.find((p) => p.weeks.includes(weekNumber)) ?? PHASES[0]
}

export function workoutByKey(key: string): Workout | undefined {
  return WORKOUTS.find((w) => w.key === key)
}

/** Returns today's suggested item from the weekly schedule. */
export function todaysSuggestion(date: Date = new Date()) {
  const dow = date.getDay() // 0 = Sun
  return WEEKLY_SCHEDULE.find((s) => s.dayIndex === dow) ?? WEEKLY_SCHEDULE[0]
}

// ----- Daily nutrition targets -----
// Calculated for the plan's starting profile (206 lbs, 5'6", 42F, lightly active)
// using Mifflin-St Jeor and a ~500 kcal deficit. Adjust if needed.
export const DAILY_TARGETS = {
  calories: 1700,
  proteinG: 145,
  carbsG: 155,
  fatG: 60,
  waterOz: 100, // 90-110 oz/day target, 100 as the round middle
} as const

export const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"] as const
export type MealType = (typeof MEAL_TYPES)[number]
