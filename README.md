# Melbl8 Clock05 Office Triptych

A three-panel multilingual office clock for Aurecon's fixed 3840 × 804 Melbourne gallery screen.

## Production layout

- Three equal 1280 × 804 panels.
- Centre: Melbourne on `#373A36`.
- Sides: rotating Aurecon offices on `#1C1B1C`.
- Two 2px dividers in `#BBC6C3`.
- Small live title row with city, `HH:MM:SS`, weekday and date.
- Two-line typed natural-language time statement.
- Side offices rotate every minute and use local language/script.

## Office rotation

The side panels cycle through Hong Kong, Shanghai, Beijing, Jakarta, Manila, Singapore, Bangkok, Ho Chi Minh City, Kuala Lumpur, Macau, Auckland, Wellington, Sydney and Brisbane. The two sides are offset so they never display the same office.

## Query controls

| Query | Purpose |
|---|---|
| `?demo=1` | Rotates offices quickly for sign-off. |
| `?demo=1&interval=4000` | Sets the demo rotation interval in milliseconds. |
| `?left=hong-kong&right=jakarta` | Pins specific side offices. |
| `?freeze=2026-08-06T00:00:00Z` | Freezes the time for QC. |
| `?noanim=1` | Disables typing animation. |
| `?debug=1` | Displays panel labels and safe area. |

## Signage

- Vanilla HTML, CSS and JavaScript.
- No analytics, external APIs, framework or WebGL.
- Melbourne and office time zones use the browser's `Intl` database.
- Fixed native canvas with automatic mobile scaling.
- Portrait phones receive a rotate prompt.
- PT Serif and Open Sans are copied into the deployed Pages build from the existing self-hosted font repository.
- `robots.txt` and page metadata block indexing and archiving.

## Quality control

Run `npm test` for phrase, rotation and timezone checks. The browser QC verifies native 3840 × 804 geometry, divider placement, local-language rendering, mobile landscape scaling and portrait rotation guidance.
