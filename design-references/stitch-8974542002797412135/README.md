# Stitch references — "Modern Landing Page Redesign"

Project: `8974542002797412135`

| Screen ID | Title | File | Rendered size |
| --- | --- | --- | --- |
| `04763f05c48a4601999787538b3de6e2` | EduMatch — Faculty Matching (Animated & Interactive) | `04763f05-dark-animated.png` | 2560 × 8860 (dark) |
| `cea82e8916254a3c82e223c51e11c134` | EduMatch — Faculty Matching (Light Mode) | `cea82e89-light.png` | 2560 × 8490 (light) |

Both are the same landing page in the two themes; the frontend implements one page
that matches both (`frontend/src/app/page.tsx` and `frontend/src/components/landing/`).

## Missing: the exported HTML

`get_screen` also returns an `htmlCode.downloadUrl` on
`contribution.usercontent.google.com`. That URL redirects to Google sign-in
(`Location: https://accounts.google.com/ServiceLogin?...`), so `curl` cannot fetch
the markup — it requires an authenticated Stitch/Google session that this machine
does not have. The screenshots above were pulled at full resolution
(`?=s0`) and were used as the implementation reference instead.

To export the markup, sign in to Google in the Preview browser and open the
`htmlCode.downloadUrl` for each screen.
