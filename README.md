# OpsLife – Personal Command Centre

Next.js 14 app for shift-aware daily routines, hydration, steps, gym, DevOps study and a six-month roadmap. All data stays in your browser (local storage). No accounts, database or environment variables.

## Run locally
Needs Node.js 18.17 or newer.

    npm install
    npm run dev      # http://localhost:3000
    npm test         # schedule checks
    npm run build    # static site in out/

## Deploy to Vercel

### Option A: GitHub (recommended)
1. Create an empty GitHub repository named `opslife`.
2. In this folder:

        git init
        git add .
        git commit -m "OpsLife"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/opslife.git
        git push -u origin main

3. On vercel.com choose **Add New → Project** and import the repository.
4. Keep the detected **Next.js** preset and default settings, then **Deploy**.

Later pushes to `main` redeploy automatically.

### Option B: Vercel CLI
    npx vercel          # sign in and create a preview
    npx vercel --prod   # publish

## First setup
1. **Settings → Monthly shift**: pick Morning, Afternoon or Night for each month.
2. Adjust goals, gym days and roadmap start date.
3. Enable browser notifications if wanted.

## Shifts
| Shift | Hours | Workday sleep |
|---|---|---|
| Morning | 05:30 AM – 02:30 PM | 09:00 PM – 04:30 AM |
| Afternoon | 12:30 PM – 09:00 PM | 11:30 PM – 07:30 AM |
| Night | 09:00 PM – 06:00 AM | 07:30 AM – 02:30 PM |

- Workdays are Sunday–Thursday; Friday and Saturday are off.
- A day runs from wake-up to the next wake-up, so water logged at 3 AM on a night shift counts towards the shift's day.
- After the last night shift, Friday has a short planned recovery sleep. The day before the first night shift includes a late bedtime, and Sunday has a pre-shift nap.
- If a month change leaves a shift clash or too little sleep, the app shows a warning.

## Limits
- Water reminders work only while the app is open. Phones may pause background tabs, and some mobile browsers show only the in-app banner.
- Steps are entered manually; there is no phone or watch sync.
- Data does not sync between devices. Use Settings → Export / Import backup. A new URL (such as a preview deployment) starts empty.
- Changing a month's shift also changes how past days in that month are shown and scored.

## Security note
Next.js 14 has published security advisories (see `npm audit`). This app builds to static files (`output: 'export'`), so no Next.js server runs in production. Upgrade to a supported Next.js release before adding server features.

## Structure
    app/          layout, page, styles
    components/   dashboard, routine, trackers, roadmap, settings
    lib/          schedule logic, storage, scoring, roadmap content
    scripts/      schedule test
