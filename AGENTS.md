# Project Guidelines

## Architecture
- This application is strictly a **local, offline-first** application.
- It uses `idb-keyval` (IndexedDB) and `zustand` for all data persistence.
- **NEVER** suggest, implement, or attempt to set up Firebase, Supabase, or any other cloud backend service.
- All features (including transcription via Whisper and data storage) must be designed to work entirely offline on the user's device.
