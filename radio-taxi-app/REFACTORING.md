# Radio Taxi App - Code Refactoring

## Overview
The `map-demo.tsx` file has been refactored from a monolithic 1200+ line file into a modular, maintainable structure with ~280 lines in the main file. All unused Expo template files have been removed.

## Clean File Structure

### Entry Point
```
app/
├── _layout.tsx          # Root layout with theme provider
└── map-demo.tsx         # Main app (280 lines, orchestrates all features)
```

### Custom Hooks (Business Logic)
```
hooks/
├── use-auth.ts          # Authentication & token management
├── use-color-scheme.ts  # Theme detection (system)
├── use-color-scheme.web.ts # Web-specific theme
├── use-location.ts      # GPS, geocoding, reverse geocoding
├── use-routing.ts       # OpenRouteService integration
├── use-theme-color.ts   # Dynamic theme colors
└── use-websocket.ts     # Real-time driver updates
```

### UI Components (Presentation)
```
components/
├── login-screen.tsx          # Full-screen login interface
├── main-map.tsx             # Main map view & bottom panel
├── map-picker-modal.tsx     # Map-based destination picker
├── menu-modal.tsx           # Slide-out menu drawer
├── route-modal.tsx          # Destination input modal
└── route-preview-modal.tsx  # Route preview with pricing
```

### Utilities & Types
```
utils/
├── api.ts         # API client functions
├── pricing.ts     # Tiered price calculation
└── ws.ts          # WebSocket client

types/
└── ride.ts        # TypeScript interfaces
```

## Removed Files (Unused Expo Template)
- ❌ `app/(tabs)/` - Example tab navigation
- ❌ `app/modal.tsx` - Example modal screen
- ❌ `components/external-link.tsx`
- ❌ `components/haptic-tab.tsx`
- ❌ `components/hello-wave.tsx`
- ❌ `components/parallax-scroll-view.tsx`
- ❌ `components/themed-text.tsx`
- ❌ `components/themed-view.tsx`
- ❌ `components/ui/` - Example UI components
- ❌ `scripts/` - Template scripts

## File Size Reduction
- **Before**: 1 monolithic file (1200+ lines)
- **After**: 13 focused modules (~100 lines each on average)
- **Main file**: Reduced from 1200+ → 280 lines (77% reduction)

## Benefits

### Maintainability
- Each file has a single responsibility
- Easy to locate specific functionality
- Reduced cognitive load when editing

### Reusability
- Hooks can be used in other components
- UI components are self-contained
- Utilities are pure functions

### Testing
- Each module can be tested in isolation
- Mocking is simplified
- Test coverage is easier to track

### Collaboration
- Multiple developers can work on different files
- Merge conflicts reduced
- Code review is more focused

## Preserved Functionality
All original behavior is maintained:
- ✅ Login-first flow
- ✅ Map-based pickup selection
- ✅ Text and map-based destination entry
- ✅ OpenRouteService routing with fallback
- ✅ Tiered pricing
- ✅ Route preview before ride creation
- ✅ WebSocket driver tracking
- ✅ Animated sliding bottom panel
- ✅ Active ride display

## Migration Notes
- No API changes
- No state structure changes
- All refs preserved
- All animations intact
- Backward compatible
