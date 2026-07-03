# Project Structure

- `src/main.jsx`: app entry point.
- `src/app/App.jsx`: router shell and route mounting.
- `src/layouts/MainLayout.jsx`: shared page frame (header/nav/content/footer).
- `src/routes/appRoutes.jsx`: single source of truth for menu + page routes.
- `src/pages/*`: feature pages.
- `src/styles/global.css`: global styles.
- `src/styles/layout.css`: layout/background styles.
- `src/assets/*`: images/icons.

## Add a New Page

1. Create a page file in `src/pages`, for example `Reports.jsx`.
2. Import it in `src/routes/appRoutes.jsx`.
3. Add one route object:
   `{ path: '/reports', label: 'Reports', element: <Reports /> }`

The navbar and routing will both update automatically.
