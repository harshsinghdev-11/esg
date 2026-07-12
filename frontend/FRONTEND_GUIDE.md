# Frontend Guide for EcoSphere

This file is a simple map for the frontend so you can understand what is going on before you write code.

## 1. What this frontend is

This project is a demo frontend for EcoSphere built with:
- Next.js
- React
- TypeScript
- Tailwind CSS

The UI is currently mock-data driven, which means most content comes from the context layer instead of a real backend API.

---

## 2. Main folders

### app/
This contains the Next.js App Router pages.

Important files:
- [app/page.tsx](app/page.tsx) -> login / landing page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) -> dashboard router for admin/employee views
- [app/layout.tsx](app/layout.tsx) -> global layout wrapper
- [app/globals.css](app/globals.css) -> global styling and design tokens
- [app/global-error.tsx](app/global-error.tsx) -> fallback error UI

### components/
This contains reusable UI pieces and full page views.

Important files:
- [components/AppShell.tsx](components/AppShell.tsx) -> shared sidebar + header + notifications shell
- [components/views/AdminDashboard.tsx](components/views/AdminDashboard.tsx) -> admin dashboard view
- [components/views/EmployeeDashboard.tsx](components/views/EmployeeDashboard.tsx) -> employee dashboard view
- [components/views/Environmental.tsx](components/views/Environmental.tsx) -> environmental section
- [components/views/Social.tsx](components/views/Social.tsx) -> social section
- [components/views/Governance.tsx](components/views/Governance.tsx) -> governance section
- [components/views/Gamification.tsx](components/views/Gamification.tsx) -> challenges, rewards, badges
- [components/views/Reports.tsx](components/views/Reports.tsx) -> reporting section
- [components/views/Settings.tsx](components/views/Settings.tsx) -> settings section

### context/
This is the state/data layer for the frontend.

Important file:
- [context/EsgContext.tsx](context/EsgContext.tsx) -> all demo/mock state and helper actions

### public/
Static assets like images and icons.

---

## 3. How the app flows

The frontend currently works like this:

1. User opens the login page from [app/page.tsx](app/page.tsx)
2. Clicking login sends the user to the dashboard route in [app/dashboard/page.tsx](app/dashboard/page.tsx)
3. The dashboard chooses the correct view based on role and query parameters
4. The shared shell in [components/AppShell.tsx](components/AppShell.tsx) wraps the active view
5. The view reads data from [context/EsgContext.tsx](context/EsgContext.tsx)

So if you want to change what a user sees:
- change the view component in components/views
- or change the route logic in app/dashboard/page.tsx

---

## 4. Best places to edit

### If you want to change the login screen
Edit:
- [app/page.tsx](app/page.tsx)

### If you want to change the dashboard layout or sidebar
Edit:
- [components/AppShell.tsx](components/AppShell.tsx)

### If you want to change the admin dashboard content
Edit:
- [components/views/AdminDashboard.tsx](components/views/AdminDashboard.tsx)

### If you want to change the employee dashboard content
Edit:
- [components/views/EmployeeDashboard.tsx](components/views/EmployeeDashboard.tsx)

### If you want to change the data shown in the UI
Edit:
- [context/EsgContext.tsx](context/EsgContext.tsx)

### If you want to change colors, spacing, typography, or general theme
Edit:
- [app/globals.css](app/globals.css)

---

## 5. Important rule: data is currently static

Most of the app is using mock/static data from [context/EsgContext.tsx](context/EsgContext.tsx).

That means:
- you do not need to connect an API for basic UI work
- if you want to display new fake data, add it inside the context file
- if you want to make the UI more realistic, update the seeded values there

There is also a file already documenting current static data usage:
- [STATIC_DATA_USAGE.md](STATIC_DATA_USAGE.md)

---

## 6. How to add a new feature safely

When you add a new feature, follow this pattern:

1. Decide which page/view should contain it
2. Add or update the relevant component under components/views
3. If it needs new data, add that data in context/EsgContext.tsx
4. If it should appear in navigation, update components/AppShell.tsx
5. If it should be reachable from the dashboard router, update app/dashboard/page.tsx

---

## 7. Common commands

Run the frontend locally:
```bash
npm run dev
```

Build the frontend:
```bash
npm run build
```

---

## 8. Good beginner workflow

If you are new to this folder, start like this:
1. Open [app/page.tsx](app/page.tsx)
2. Open [components/AppShell.tsx](components/AppShell.tsx)
3. Open [components/views/AdminDashboard.tsx](components/views/AdminDashboard.tsx)
4. Open [components/views/EmployeeDashboard.tsx](components/views/EmployeeDashboard.tsx)
5. Open [context/EsgContext.tsx](context/EsgContext.tsx)

That is the core path of the app.

---

## 9. Quick advice

- Keep UI changes inside components/views or app/page.tsx
- Keep shared layout changes inside components/AppShell.tsx
- Keep demo data changes inside context/EsgContext.tsx
- Keep global styling changes inside app/globals.css

If you are unsure where to place a change, ask this question:
- Is it page content? -> edit a view file
- Is it shared layout? -> edit AppShell
- Is it demo data? -> edit EsgContext
- Is it theme styling? -> edit globals.css

---

## 10. Recommended next step

For your next task, start with one simple edit such as:
- change a card title
- change a button label
- add a new stat card to a dashboard
- change the mock data shown on a screen

That will help you learn the structure quickly without breaking the app.
