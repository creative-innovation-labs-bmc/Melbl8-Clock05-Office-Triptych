# Project brief

## Description

A three-panel multilingual world-office clock for the 3840 × 804 Melbourne gallery display.

## Build brief

Purpose:
Create a new, independent gallery-screen clock for Aurecon's 3840 × 804 display and NVIDIA Shield/Enplug playback.

Layout:
- Fixed 3840 × 804 canvas divided into three equal 1280px panels.
- Thin 2px vertical dividers in Aurecon light grey #BBC6C3.
- Centre panel background #373A36.
- Left and right panel backgrounds #1C1B1C.
- Automatic viewport scaling and a usable mobile landscape preview.

Centre panel:
- Always Melbourne.
- Small title row: Melbourne HH:MM:SS Day Date.
- Larger two-line natural-language time statement typed in with a cursor.
- Time wording in Aurecon green #89C925.

Side panels:
- Rotate through current Aurecon offices every minute, with different offices on left and right.
- Include Hong Kong, Shanghai, Beijing, Jakarta, Manila, Singapore, Bangkok, Ho Chi Minh City, Kuala Lumpur, Macau and selected New Zealand offices.
- Display the local city title, live local time, day and date.
- Main two-line statement uses the local language/script where suitable: Traditional Chinese, Simplified Chinese, Indonesian, Filipino/Tagalog, Thai, Vietnamese and Malay; English for English-speaking offices.
- Each new office deletes/types in rather than abruptly replacing.

Typography and performance:
- Use the existing locally hosted PT Serif and Open Sans assets from the PT Serif clock where glyphs are supported.
- Use suitable Noto/system serif fallbacks for Chinese and Thai scripts.
- Vanilla HTML/CSS/JavaScript only. No frameworks or WebGL.
- Optimised for NVIDIA Shield signage.

Privacy and deployment:
- GitHub Pages.
- noindex, nofollow, noarchive, nosnippet and robots.txt Disallow: /.
- No analytics and no external APIs at runtime.

QC:
- Verify exact 3840 × 804 geometry.
- Verify three equal panels, divider positions and colours.
- Verify Melbourne live time and side-office time zones.
- Verify office rotation and language rendering.
- Verify no text overflow in every panel.
- Verify mobile portrait prompt and mobile landscape scaling.
