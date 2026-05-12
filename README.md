# OnsiteDB

OnsiteDB is a React + TypeScript onsite camp operations app. It helps an agent log in with OTP, select an active camp, search appointments, review appointment details, collect samples, enter test results, and update provider assignment.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- Zustand for app state
- Axios for API calls
- React Hook Form + Zod
- Recharts and TanStack Table for data-heavy UI

## Prerequisites

- Node.js 22.x
- npm
- Access to the eKincare onsite backend
- A valid onsite agent mobile number for OTP login

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Confirm the API base URL in `src/api/client.ts`:

   ```ts
   export const API_BASE_URL = 'https://thanos.ekincare.com';
   ```

   The app currently uses this constant directly. If you need staging, QA, or local backend support, update this value or move it to a Vite environment variable before release.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite, usually:

   ```text
   http://localhost:5173
   ```

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks the app and creates a production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## App Flow

1. Agent opens `/login`.
2. Agent enters mobile number and receives OTP.
3. OTP verification returns the agent profile, active camps, and `X-AGENT-KEY`.
4. Agent selects a camp from `/select-camp`.
5. The selected camp unlocks the dashboard, search, appointment detail, sample collection, and test result flows.
6. If any API returns `401`, the app clears local/session storage and redirects the agent back to login.

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | OTP login and resend OTP |
| `/select-camp` | Active camp selection |
| `/` | Camp dashboard |
| `/search` | Search for users or appointments in the selected camp |
| `/component-entry/:userId` | Sample/component entry flow |
| `/booking-review/:userId` | Booking review flow |
| `/appointment/:id` | Appointment details, provider assignment, sample status, and test result entry |
| `/failures` | Local booking failure queue |

## API Configuration

All API calls are made through `src/api/client.ts`.

- Base URL: `https://thanos.ekincare.com`
- Default headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Auth header:
  - `X-AGENT-KEY`
- Timeout:
  - `30_000` ms

After OTP verification, the token is stored in both `localStorage` and `sessionStorage` under `X-AGENT-KEY`. The Axios request interceptor automatically attaches this value to every request.

Stored auth and camp keys:

| Storage Key | Purpose |
| --- | --- |
| `X-AGENT-KEY` | API auth token returned by OTP verification |
| `agent` | Logged-in agent profile |
| `camps` | Active camps returned by login or camp fetch |
| `selectedCamp` | Currently selected camp |

## APIs Added

The public API wrapper is exported from `src/api/index.ts` as `api`.

### Auth APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.validateAgent(mobile)` | `POST` | `/v3/onsite/sessions/send_otp` | Sends OTP to a valid Indian mobile number |
| `api.resendOtp(mobile)` | `POST` | `/v3/onsite/sessions/send_otp` | Resends OTP using the same endpoint |
| `api.verifyOtp(mobile, otp)` | `POST` | `/v3/onsite/sessions/verify_otp` | Verifies OTP, stores `X-AGENT-KEY`, normalizes agent data, and stores active camps |
| `api.logout()` | `DELETE` | `/v3/onsite/logout` | Logs out the agent and clears local/session auth data |

Request examples:

```ts
await api.validateAgent('9876543210');
await api.verifyOtp('9876543210', '123456');
await api.logout();
```

### Camp APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.getActiveCamps()` | `GET` | `/v3/onsite/camps` | Fetches active camps available to the logged-in agent |
| `api.getCampDashboard(campId)` | `GET` | `/v3/onsite/camps/:campId/dashboard` | Fetches camp details and dashboard counts |

Dashboard stats normalized by the app:

```ts
{
  total_appointments: number;
  completed: number;
  confirmed: number;
  in_progress: number;
}
```

### Appointment Search APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.searchAppointments(campId, term)` | `GET` | `/v3/onsite/camps/:campId/search?q=:term` | Searches appointments/users inside a camp |
| `api.searchUser(campId, term)` | `GET` | `/v3/onsite/camps/:campId/search?q=:term` | Returns the first matching user, appointment, and package for user-centric pages |

### Appointment Detail APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.getAppointmentDetails(campId, appointmentId)` | `GET` | `/v3/onsite/camps/:campId/appointments/:appointmentId` and `/test_sections` | Fetches appointment details and test sections in parallel |
| `api.getTestSections(campId, appointmentId)` | `GET` | `/v3/onsite/camps/:campId/appointments/:appointmentId/test_sections` | Fetches only test sections and normalizes them into module schema |

`getAppointmentDetails` returns normalized:

- `appointment`
- `user`
- `package`
- `packages`
- `entries`
- `modules`
- `providers`

### Sample Collection and Result APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.saveComponentEntry(campId, appointmentId, sampleCollectionId, payload)` | `PUT` | `/v3/onsite/camps/:campId/appointments/:appointmentId/sample_collections/:sampleCollectionId` | Alias for `saveSampleCollection` |
| `api.saveSampleCollection(campId, appointmentId, sampleCollectionId, payload)` | `PUT` | `/v3/onsite/camps/:campId/appointments/:appointmentId/sample_collections/:sampleCollectionId` | Saves sample collection status/details |
| `api.saveTestResults(campId, appointmentId, payload)` | `PUT` | `/v3/onsite/camps/:campId/appointments/:appointmentId/test_results` | Saves completed test component results |

`saveTestResults` payload shape:

```ts
{
  components: [
    {
      id: string | number;
      type: 'test_component';
      result: string | number | boolean;
      status: 'done';
    }
  ];
}
```

### Provider Assignment APIs

| Wrapper | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| `api.attachProviderToAppointment(campId, appointmentId, providerId)` | `PUT` | `/v3/onsite/camps/:campId/appointments/:appointmentId` | Assigns a provider to the whole appointment |
| `api.updateAppointmentTestProvider(campId, appointmentId, appointmentTestId, payload)` | `PUT` | `/v3/onsite/camps/:campId/appointments/:appointmentId/appointment_tests/:appointmentTestId` | Updates provider/details for one appointment test |

Provider assignment example:

```ts
await api.attachProviderToAppointment(campId, appointmentId, providerId);

await api.updateAppointmentTestProvider(campId, appointmentId, appointmentTestId, {
  provider_id: providerId,
});
```

### Booking API Placeholder

| Wrapper | Status | Purpose |
| --- | --- | --- |
| `api.createBooking(request)` | Not configured | Currently throws `Booking API endpoint is not configured for this app.` |

The booking review page calls this wrapper, but the real backend endpoint has not been wired yet. A new developer should configure this before enabling booking creation in production.

## Data Normalization

API responses are normalized in `src/api/normalizers.ts` before reaching pages. This keeps UI components stable even when backend payloads use different keys such as `customer`, `user`, `member`, `package`, `health_package`, `sections`, `modules`, or `sample_collections`.

Core app types are defined in `src/types/index.ts`, including:

- `Agent`
- `Camp`
- `User`
- `Appointment`
- `Package`
- `ComponentEntry`
- `MedicalModuleSchema`
- `HealthProvider`
- `SampleCollectionStatus`
- `ReportStatus`

## State Management

Global state lives in `src/store/index.ts` using Zustand.

It stores:

- logged-in agent
- `X-AGENT-KEY`
- active camps
- selected camp
- current search result
- draft entries
- local booking failures

Auth and camp state are hydrated from browser storage on app load.

## Development Notes

- Protected routes require both `agent` and `X-AGENT-KEY`.
- Camp-specific pages require `selectedCamp`.
- Development builds log API requests, responses, and errors in the browser console.
- API errors are converted to readable messages through `getApiErrorMessage`.
- A `401` response dispatches `onsite:unauthorized`, clears auth storage, and redirects to `/login`.
- `vite.config.ts` uses `base: './'`, so production assets are built with relative paths.

## Build for Production

```bash
npm run build
```

The production output is generated in `dist/`.
