# Design Document - Innovation Landing Page

## Overview

Innovation Landing Page adalah aplikasi web full-stack yang responsif, dirancang untuk menampilkan inovasi organisasi dengan fitur pendaftaran pengunjung, galeri multimedia (PowerPoint & video), dan game interaktif dengan sistem scoring. Aplikasi ini dibangun dengan fokus pada pengalaman pengguna yang optimal di semua perangkat (mobile, tablet, desktop) tanpa masalah overflow atau spacing.

**Technology Stack:**
- **Frontend**: React.js dengan TypeScript untuk type safety
- **Styling**: Tailwind CSS untuk responsive design yang cepat dan konsisten
- **Icons**: Lucide React untuk icon library
- **State Management**: React Context API + Hooks
- **Backend**: Node.js dengan Express.js
- **Database**: MongoDB untuk fleksibilitas schema
- **File Storage**: Multer untuk upload handling, cloud storage (AWS S3 atau Cloudinary)
- **Real-time**: Socket.io untuk multiplayer game
- **Game Engine**: HTML5 Canvas atau Phaser.js untuk game development

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Admin     │  │     Game     │      │
│  │     Page     │  │    Panel     │  │    Module    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼──────┐  ┌────▼─────────┐
            │   REST API   │  │  WebSocket   │
            │   (Express)  │  │  (Socket.io) │
            └───────┬──────┘  └────┬─────────┘
                    │               │
        ┌───────────┴───────────────┴──────────┐
        │         Application Layer            │
        │  ┌────────────┐  ┌────────────┐     │
        │  │  Visitor   │  │ Innovation │     │
        │  │  Service   │  │  Service   │     │
        │  └────────────┘  └────────────┘     │
        │  ┌────────────┐  ┌────────────┐     │
        │  │   Game     │  │   Upload   │     │
        │  │  Service   │  │  Service   │     │
        │  └────────────┘  └────────────┘     │
        └──────────────────┬───────────────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │         Data Layer                   │
        │  ┌────────────┐  ┌────────────┐     │
        │  │  MongoDB   │  │   Cloud    │     │
        │  │  Database  │  │  Storage   │     │
        │  └────────────┘  └────────────┘     │
        └──────────────────────────────────────┘
```

### Component Architecture (Frontend)

```
App
├── Layout
│   ├── Header (Navigation)
│   ├── Main Content
│   └── Footer
├── Pages
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── VisitorRegistrationSection
│   │   ├── InnovationGallerySection
│   │   └── GameSection
│   ├── AdminPage
│   │   ├── VisitorManagement
│   │   ├── ContentUpload
│   │   └── Analytics
│   └── GamePage
│       ├── GameCanvas
│       ├── GameControls
│       └── Leaderboard
└── Shared Components
    ├── Button
    ├── Input
    ├── Card
    ├── Modal
    └── Loading
```

## Components and Interfaces

### 1. Frontend Components

#### VisitorRegistrationForm Component
```typescript
interface VisitorFormData {
  nama: string;
  instansi: string;
  jabatan: string;
  noHandphone: string;
}

interface VisitorRegistrationFormProps {
  onSubmitSuccess: (visitor: VisitorFormData) => void;
  onSubmitError: (error: string) => void;
}

// Component handles form validation, submission, and user feedback
```

#### InnovationGallery Component
```typescript
interface InnovationItem {
  id: string;
  title: string;
  description: string;
  type: 'powerpoint' | 'video';
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

interface InnovationGalleryProps {
  items: InnovationItem[];
  onItemClick: (item: InnovationItem) => void;
}

// Component displays grid of innovation items with preview
```

#### GameModule Component
```typescript
interface GameConfig {
  mode: 'single' | 'multiplayer';
  difficulty?: 'easy' | 'medium' | 'hard';
  roomCode?: string;
}

interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
}

interface GameModuleProps {
  config: GameConfig;
  onGameEnd: (finalScore: number) => void;
}

// Component manages game logic, rendering, and state
```

#### Leaderboard Component
```typescript
interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  playedAt: Date;
  mode: 'single' | 'multiplayer';
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserScore?: number;
  limit?: number;
}

// Component displays sorted leaderboard with highlighting
```

### 2. Backend API Endpoints

#### Visitor Management API
```typescript
// POST /api/visitors - Register new visitor
interface RegisterVisitorRequest {
  nama: string;
  instansi: string;
  jabatan: string;
  noHandphone: string;
}

interface RegisterVisitorResponse {
  success: boolean;
  data?: {
    id: string;
    registeredAt: Date;
  };
  error?: string;
}

// GET /api/visitors - Get all visitors (admin only)
interface GetVisitorsResponse {
  success: boolean;
  data?: VisitorRecord[];
  total: number;
}

// GET /api/visitors/export - Export visitors to CSV
```

#### Innovation Content API
```typescript
// POST /api/innovations - Upload new innovation content
interface UploadInnovationRequest {
  title: string;
  description: string;
  type: 'powerpoint' | 'video';
  file: File;
}

// GET /api/innovations - Get all innovation items
interface GetInnovationsResponse {
  success: boolean;
  data?: InnovationItem[];
}

// DELETE /api/innovations/:id - Delete innovation item
```

#### Game API
```typescript
// POST /api/game/score - Submit game score
interface SubmitScoreRequest {
  playerName: string;
  score: number;
  mode: 'single' | 'multiplayer';
}

// GET /api/game/leaderboard - Get leaderboard
interface GetLeaderboardResponse {
  success: boolean;
  data?: LeaderboardEntry[];
}

// WebSocket Events for Multiplayer
interface MultiplayerEvents {
  'room:create': (roomCode: string) => void;
  'room:join': (roomCode: string, playerId: string) => void;
  'game:start': (roomCode: string) => void;
  'game:update': (gameState: GameState) => void;
  'game:end': (scores: Record<string, number>) => void;
}
```

## Data Models

### Visitor Model
```typescript
interface Visitor {
  _id: string;
  nama: string;
  instansi: string;
  jabatan: string;
  noHandphone: string;
  registeredAt: Date;
  ipAddress?: string;
}

// MongoDB Schema
const VisitorSchema = {
  nama: { type: String, required: true, trim: true },
  instansi: { type: String, required: true, trim: true },
  jabatan: { type: String, required: true, trim: true },
  noHandphone: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => /^(\+62|62|0)[0-9]{9,12}$/.test(v),
      message: 'Format nomor handphone tidak valid'
    }
  },
  registeredAt: { type: Date, default: Date.now },
  ipAddress: { type: String }
};
```

### Innovation Model
```typescript
interface Innovation {
  _id: string;
  title: string;
  description: string;
  type: 'powerpoint' | 'video';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
}

// MongoDB Schema
const InnovationSchema = {
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['powerpoint', 'video'], 
    required: true 
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  thumbnailUrl: { type: String },
  uploadedBy: { type: String, default: 'admin' },
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
};
```

### GameScore Model
```typescript
interface GameScore {
  _id: string;
  playerName: string;
  score: number;
  mode: 'single' | 'multiplayer';
  level: number;
  duration: number; // in seconds
  playedAt: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

// MongoDB Schema
const GameScoreSchema = {
  playerName: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0 },
  mode: { 
    type: String, 
    enum: ['single', 'multiplayer'], 
    required: true 
  },
  level: { type: Number, default: 1 },
  duration: { type: Number, required: true },
  playedAt: { type: Date, default: Date.now },
  deviceType: { 
    type: String, 
    enum: ['mobile', 'tablet', 'desktop'],
    required: true
  }
};

// Index for leaderboard queries
// Index: { score: -1, playedAt: -1 }
```

### GameRoom Model (for Multiplayer)
```typescript
interface GameRoom {
  _id: string;
  roomCode: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid visitor data persistence
*For any* valid visitor data (with all required fields filled), submitting the registration form should result in the data being stored in the database and retrievable.
**Validates: Requirements 1.2**

### Property 2: Empty field validation rejection
*For any* combination of empty required fields in the visitor form, the system should reject the submission and display appropriate validation messages.
**Validates: Requirements 1.3**

### Property 3: Phone number format validation
*For any* phone number input, the system should accept valid Indonesian phone number formats (+62xxx, 62xxx, 0xxx with 9-12 digits) and reject invalid formats.
**Validates: Requirements 1.4**

### Property 4: Form reset after successful submission
*For any* successful visitor registration, the form fields should be cleared and ready for the next entry.
**Validates: Requirements 1.5**

### Property 5: Innovation gallery completeness
*For any* set of innovation items in the database, all items should be displayed in the gallery with their metadata (title, description, upload date).
**Validates: Requirements 2.1, 2.4**

### Property 6: PowerPoint file validation
*For any* file upload attempt in the admin panel, PowerPoint files (ppt, pptx) within size limits should be accepted, and other file types or oversized files should be rejected.
**Validates: Requirements 3.2**

### Property 7: Video file validation
*For any* file upload attempt in the admin panel, video files (mp4, webm, avi) within size limits should be accepted, and other file types or oversized files should be rejected.
**Validates: Requirements 3.3**

### Property 8: Upload persistence and gallery appearance
*For any* successful file upload, the innovation item should be stored in both file storage and database, and should immediately appear in the gallery.
**Validates: Requirements 3.4, 3.5**

### Property 9: Game score persistence
*For any* completed game session, the final score should be saved to the leaderboard with player name, mode, and timestamp.
**Validates: Requirements 4.5**

### Property 10: Leaderboard sorting consistency
*For any* set of game scores, the leaderboard should always display them in descending order (highest score first).
**Validates: Requirements 5.2**

### Property 11: Leaderboard entry completeness
*For any* leaderboard entry, it should contain player name, score, and play date information.
**Validates: Requirements 5.3**

### Property 12: Score update reflection
*For any* new score submission, the leaderboard should update to include the new score in the correct sorted position.
**Validates: Requirements 5.4**

### Property 13: No horizontal overflow on mobile
*For any* viewport width between 320px and 767px, no element should cause horizontal scrolling (overflow-x).
**Validates: Requirements 6.1, 6.4**

### Property 14: No horizontal overflow on tablet
*For any* viewport width between 768px and 1023px, no element should cause horizontal scrolling (overflow-x).
**Validates: Requirements 6.2, 6.4**

### Property 15: No horizontal overflow on desktop
*For any* viewport width 1024px and above, no element should cause horizontal scrolling (overflow-x).
**Validates: Requirements 6.3, 6.4**

### Property 16: Media responsiveness
*For any* image or video element and any viewport size, the media should scale proportionally without exceeding container bounds.
**Validates: Requirements 6.5**

### Property 17: Navigation scroll behavior
*For any* navigation menu item clicked, the page should scroll smoothly to the corresponding section.
**Validates: Requirements 7.2**

### Property 18: Mobile hamburger menu functionality
*For any* viewport width below 768px, the navigation should display as a hamburger menu that can be toggled open and closed.
**Validates: Requirements 7.3**

### Property 19: Active menu highlighting
*For any* section currently in viewport, the corresponding navigation menu item should be visually highlighted.
**Validates: Requirements 7.5**

### Property 20: Visitor data completeness in admin panel
*For any* visitor record displayed in the admin panel, it should show all fields: nama, instansi, jabatan, nomor handphone, and registration timestamp.
**Validates: Requirements 8.2**

### Property 21: Visitor search functionality
*For any* search query in the admin panel, the results should only include visitors whose name or institution contains the search term.
**Validates: Requirements 8.3**

### Property 22: Icon library consistency
*For any* icon element in the application, it should be rendered using the Lucide React icon library.
**Validates: Requirements 9.1**

### Property 23: Interactive element hover feedback
*For any* interactive element (button, link, card), hovering should trigger a visual state change.
**Validates: Requirements 9.3**

### Property 24: Touch control responsiveness on mobile
*For any* touch input on mobile devices during gameplay, the game should respond within 100ms.
**Validates: Requirements 10.1**

### Property 25: Game frame rate maintenance
*For any* game session on mobile devices, the frame rate should maintain at least 30 FPS during normal gameplay.
**Validates: Requirements 10.2**

### Property 26: Orientation change adaptation
*For any* device orientation change during gameplay, the game layout should adapt within 500ms without losing game state.
**Validates: Requirements 10.3**



## Error Handling

### Frontend Error Handling

#### Form Validation Errors
```typescript
interface ValidationError {
  field: string;
  message: string;
}

// Display inline validation errors
// Show toast notifications for submission errors
// Prevent multiple submissions with loading states
```

#### Network Errors
```typescript
// Implement retry logic for failed requests
// Show user-friendly error messages
// Maintain form data on network failure
// Implement offline detection and messaging
```

#### File Upload Errors
```typescript
enum UploadErrorType {
  FILE_TOO_LARGE = 'File size exceeds maximum limit',
  INVALID_FILE_TYPE = 'File type not supported',
  UPLOAD_FAILED = 'Upload failed, please try again',
  NETWORK_ERROR = 'Network error, check your connection'
}

// Show progress bar during upload
// Allow upload cancellation
// Provide clear error messages with retry option
```

#### Game Errors
```typescript
// Handle WebSocket disconnection gracefully
// Save game state periodically
// Implement reconnection logic for multiplayer
// Show error overlay with retry option
```

### Backend Error Handling

#### API Error Responses
```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Standard error codes:
// - VALIDATION_ERROR: Input validation failed
// - NOT_FOUND: Resource not found
// - UNAUTHORIZED: Authentication required
// - FORBIDDEN: Insufficient permissions
// - SERVER_ERROR: Internal server error
// - FILE_UPLOAD_ERROR: File upload failed
```

#### Database Errors
```typescript
// Implement connection pooling
// Handle connection timeouts
// Implement retry logic for transient errors
// Log errors for monitoring
// Return user-friendly messages (hide internal details)
```

#### File Storage Errors
```typescript
// Handle storage quota exceeded
// Implement fallback storage options
// Clean up failed uploads
// Validate file integrity after upload
```

## Testing Strategy

### Unit Testing

**Framework**: Jest with React Testing Library for frontend, Jest for backend

**Frontend Unit Tests:**
- Component rendering tests
- Form validation logic
- User interaction handlers
- State management logic
- Utility functions
- API client functions

**Backend Unit Tests:**
- API endpoint handlers
- Database model methods
- Validation functions
- File upload utilities
- Authentication/authorization logic

**Example Unit Tests:**
```typescript
// Test visitor form validation
describe('VisitorForm Validation', () => {
  test('should reject empty nama field', () => {
    const result = validateVisitorForm({ nama: '', instansi: 'Test', jabatan: 'Test', noHandphone: '081234567890' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Nama harus diisi');
  });
  
  test('should accept valid Indonesian phone number', () => {
    const validNumbers = ['+6281234567890', '6281234567890', '081234567890'];
    validNumbers.forEach(number => {
      expect(validatePhoneNumber(number)).toBe(true);
    });
  });
});

// Test leaderboard sorting
describe('Leaderboard', () => {
  test('should sort scores in descending order', () => {
    const scores = [
      { playerName: 'Player1', score: 100 },
      { playerName: 'Player2', score: 500 },
      { playerName: 'Player3', score: 300 }
    ];
    const sorted = sortLeaderboard(scores);
    expect(sorted[0].score).toBe(500);
    expect(sorted[1].score).toBe(300);
    expect(sorted[2].score).toBe(100);
  });
});
```

### Property-Based Testing

**Framework**: fast-check for JavaScript/TypeScript

**Configuration**: Each property test should run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

**Property Test Tagging**: Each property-based test MUST include a comment tag in this format:
```typescript
// **Feature: innovation-landing-page, Property {number}: {property_text}**
```

**Key Property Tests:**

1. **Visitor Registration Round-Trip**
   - Generate random valid visitor data
   - Submit and retrieve from database
   - Verify data integrity

2. **Phone Number Validation**
   - Generate various phone number formats
   - Test validation accepts valid formats
   - Test validation rejects invalid formats

3. **File Upload Validation**
   - Generate various file types and sizes
   - Test acceptance of valid files
   - Test rejection of invalid files

4. **Leaderboard Sorting**
   - Generate random score sets
   - Verify consistent descending order
   - Test with edge cases (equal scores, single score)

5. **Responsive Layout**
   - Test various viewport widths
   - Verify no horizontal overflow
   - Test media scaling

**Example Property Tests:**
```typescript
import fc from 'fast-check';

// **Feature: innovation-landing-page, Property 1: Valid visitor data persistence**
describe('Property: Visitor Data Persistence', () => {
  it('should persist and retrieve any valid visitor data', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          nama: fc.string({ minLength: 1, maxLength: 100 }),
          instansi: fc.string({ minLength: 1, maxLength: 100 }),
          jabatan: fc.string({ minLength: 1, maxLength: 100 }),
          noHandphone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (visitorData) => {
          const saved = await saveVisitor(visitorData);
          const retrieved = await getVisitor(saved.id);
          expect(retrieved).toMatchObject(visitorData);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 10: Leaderboard sorting consistency**
describe('Property: Leaderboard Sorting', () => {
  it('should always sort scores in descending order', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            playerName: fc.string(),
            score: fc.integer({ min: 0, max: 999999 })
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (scores) => {
          const sorted = sortLeaderboard(scores);
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].score).toBeGreaterThanOrEqual(sorted[i + 1].score);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 13: No horizontal overflow on mobile**
describe('Property: Mobile Responsive Layout', () => {
  it('should have no horizontal overflow on any mobile viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          const bodyWidth = document.body.scrollWidth;
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Framework**: Cypress or Playwright for E2E testing

**Test Scenarios:**
- Complete visitor registration flow
- Admin upload and gallery display flow
- Single player game flow with score submission
- Multiplayer game flow with multiple clients
- Responsive behavior across device sizes
- Navigation and routing

### Performance Testing

**Metrics to Monitor:**
- Page load time (target: < 3s on 3G)
- Time to Interactive (target: < 5s)
- First Contentful Paint (target: < 2s)
- Game frame rate (target: ≥ 30 FPS on mobile)
- API response time (target: < 500ms)

**Tools:**
- Lighthouse for web vitals
- Chrome DevTools Performance tab
- WebPageTest for real-world testing

### Accessibility Testing

**Requirements:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 for text)
- Touch target size (minimum 44x44px)

**Tools:**
- axe DevTools
- WAVE browser extension
- Manual keyboard testing

## Game Design Specification

### Game Concept: "Innovation Catcher"

**Game Type**: Arcade-style catching game optimized for mobile

**Gameplay:**
- Innovation items (lightbulbs, gears, documents) fall from the top
- Player controls a basket/character at the bottom
- Catch good items (green) for points
- Avoid bad items (red) that reduce score/lives
- Progressive difficulty with increasing speed

**Controls:**
- **Mobile**: Touch and drag, or tilt device
- **Desktop**: Mouse movement or arrow keys

**Scoring System:**
```typescript
interface ScoringRules {
  goodItemPoints: 10;
  bonusItemPoints: 50;
  badItemPenalty: -5;
  comboMultiplier: 1.5; // for consecutive catches
  levelCompletionBonus: 100;
}
```

**Multiplayer Mode:**
- 2-4 players in same room
- Competitive: highest score wins
- Real-time score updates via WebSocket
- 2-minute rounds

### Alternative Game: "Innovation Quiz"

**Game Type**: Timed quiz game

**Gameplay:**
- Multiple choice questions about innovation
- Time limit per question (15 seconds)
- Points based on speed and accuracy
- Difficulty increases with progress

**Multiplayer:**
- Head-to-head competition
- First to answer correctly gets points
- Best of 10 questions

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel or Netlify
- **Build**: Production-optimized React build
- **CDN**: Automatic via platform
- **Environment Variables**: API endpoints, feature flags

### Backend Deployment
- **Platform**: Railway, Render, or AWS EC2
- **Database**: MongoDB Atlas (managed)
- **File Storage**: AWS S3 or Cloudinary
- **Environment**: Node.js 18+ LTS

### CI/CD Pipeline
```yaml
# Automated workflow
1. Code push to main branch
2. Run linting and type checking
3. Run unit tests
4. Run property-based tests
5. Build frontend and backend
6. Deploy to staging
7. Run E2E tests on staging
8. Deploy to production (manual approval)
```

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate file uploads (type, size, content)
- Prevent SQL/NoSQL injection
- Implement rate limiting

### File Upload Security
- Scan uploaded files for malware
- Restrict file types with whitelist
- Limit file sizes
- Store files with random names
- Serve files from separate domain

### API Security
- Implement CORS properly
- Use HTTPS only
- Implement request rate limiting
- Add CSRF protection
- Validate JWT tokens (if using authentication)

### Data Privacy
- Hash sensitive data
- Implement data retention policies
- Provide data export functionality
- Comply with privacy regulations

## Monitoring and Analytics

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic or DataDog)
- Uptime monitoring (UptimeRobot)
- Log aggregation (LogRocket or Papertrail)

### User Analytics
- Page views and user flows
- Visitor registration conversion rate
- Game play statistics
- Innovation content engagement
- Device and browser distribution

### Metrics Dashboard
- Total visitors registered
- Total games played
- Average game score
- Most viewed innovation content
- System health indicators
