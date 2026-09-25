# TOLVANO WCC — GitHub Pages source

Private owner-facing UI artifact intended for `https://app.tolvano.com`.

## Hosting model

- Host: GitHub Pages.
- The public marketing site remains in the existing `has90almr/TOLVANO` Pages site at `https://tolvano.com`.
- WCC must use a **separate public repository / Pages site** so the two origins stay isolated.
- This directory is the complete source payload to copy to the root of that dedicated repository.
- `CNAME` is already set to `app.tolvano.com`.
- `.nojekyll` is included so GitHub serves the static assets directly.

## Security posture

- Static HTML/CSS/JS only.
- No service-role key, OpenAI key, provider secret, worker credential, mail credential, or database password.
- Browser contains only the Supabase publishable key.
- WCC data is returned only by the JWT-protected `tolvano-wcc-control` Edge Function after a private OWNER binding check.
- Access token is kept in `sessionStorage` only; no refresh token is persisted by this client.
- Control/mutation/commercial-action/external-effect actions remain disabled until Full Executable closure and independent review.

## DNS

Authoritative DNS for `tolvano.com` is currently on Spaceship:
- `launch1.spaceship.net`
- `launch2.spaceship.net`

After the dedicated GitHub Pages repository exists and Pages is enabled, configure:
- Type: `CNAME`
- Host: `app`
- Value: `has90almr.github.io`

GitHub recommends adding the custom domain in the repository Pages settings before creating the DNS record.
