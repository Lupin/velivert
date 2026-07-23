# Changelog

## 1.0.1 — 2026-07-23

FIX
- Import main.ts in the page — G2 bridge was never loaded, glasses display stayed black
- Geolocation fallback to Saint-Étienne centre when GPS is unavailable (simulator)

## 1.0.0 — 2026-07-22

ADD
- Real-time Vélivert station finder for Saint-Étienne
- Shows the 3 nearest stations on the glasses display
- Companion phone UI with station list, radius slider, and detail view
- Tap the glasses temple to refresh station data
- Auto-refresh every 60 seconds
- GPS-based geolocation with clear permission guide
- Dark-themed interface matching the Even Realities design language
