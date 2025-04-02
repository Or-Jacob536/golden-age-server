# Golden Age API Documentation

## Base URL
```
http://localhost:3000/api
```

For production, the base URL will be your deployed server address.

## Authentication
The API uses JWT token-based authentication with token rotation.

### Token System
- **Access Token**: Short-lived token (15 minutes) that is used for authentication.
- **Refresh Token**: Longer-lived token (7 days) that is used to get a new access token.
- **Token Rotation**: When a refresh token is used, it is invalidated and a new refresh token is issued.

### Authentication Headers
For protected routes, include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

#### Register a new user
```
POST /auth/register
```

**Request Body**:
```json
{
  "firstName": "שם פרטי",
  "lastName": "שם משפחה",
  "email": "user@example.com",
  "password": "securePassword123",
  "phoneNumber": "0541234567"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "משתמש נרשם בהצלחה",
  "userId": 1
}
```

#### Login
```
POST /auth/login
```

**Request Body**:
```json
{
  "identifier": "user@example.com", // Can be email or phone number
  "password": "securePassword123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "שם פרטי",
    "lastName": "שם משפחה",
    "email": "user@example.com",
    "phoneNumber": "0541234567"
  }
}
```

#### Refresh Token
```
POST /auth/refresh-token
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```
POST /auth/logout
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "התנתקות בוצעה בהצלחה"
}
```

#### Forgot Password
```
POST /auth/forgot-password
```

**Request Body**:
```json
{
  "identifier": "user@example.com" // Can be email or phone number
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "הוראות לאיפוס סיסמה נשלחו"
}
```

#### Reset Password
```
POST /auth/reset-password
```

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "סיסמה שונתה בהצלחה"
}
```

### User

#### Get User Profile
```
GET /users/profile
```

**Response**: 200 OK
```json
{
  "id": 1,
  "firstName": "שם פרטי",
  "lastName": "שם משפחה",
  "email": "user@example.com",
  "phoneNumber": "0541234567",
  "languagePreference": "he",
  "darkMode": false,
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Update User Profile
```
PUT /users/profile
```

**Request Body**:
```json
{
  "firstName": "שם חדש",
  "lastName": "שם משפחה חדש",
  "phoneNumber": "0541234568"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "פרופיל עודכן בהצלחה",
  "user": {
    "id": 1,
    "firstName": "שם חדש",
    "lastName": "שם משפחה חדש",
    "email": "user@example.com",
    "phoneNumber": "0541234568",
    "languagePreference": "he",
    "darkMode": false,
    "updatedAt": "2023-01-02T12:00:00.000Z"
  }
}
```

#### Update User Settings
```
PUT /users/settings
```

**Request Body**:
```json
{
  "languagePreference": "en",
  "darkMode": true
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "languagePreference": "en",
    "darkMode": true
  }
}
```

### Restaurant

#### Get Restaurant Hours
```
GET /restaurant/hours
```

**Response**: 200 OK
```json
{
  "weekdays": {
    "breakfast": "07:00-09:30",
    "lunch": "12:00-14:00",
    "dinner": "18:00-20:00"
  },
  "weekend": {
    "breakfast": "07:30-10:00",
    "lunch": "12:30-14:30",
    "dinner": "18:00-20:00"
  }
}
```

#### Get Daily Menu
```
GET /restaurant/menu?date=2023-06-01
```

If date is not provided, returns today's menu.

**Response**: 200 OK
```json
{
  "date": "2023-06-01",
  "meals": {
    "breakfast": {
      "mainDishes": ["חביתה", "חלה עם גבינות", "סלט ירקות"],
      "sides": ["יוגורט", "גרנולה", "פירות"],
      "drinks": ["תה", "קפה", "מיץ תפוזים"]
    },
    "lunch": {
      "mainDishes": ["עוף צלוי", "דג אפוי", "קציצות ירק"],
      "sides": ["אורז", "תפוחי אדמה", "ירקות מאודים"],
      "desserts": ["עוגת תפוחים", "פירות"]
    },
    "dinner": {
      "mainDishes": ["מרק ירקות", "לזניה", "סלט"],
      "sides": ["לחם", "גבינות", "ירקות חתוכים"],
      "desserts": ["פודינג", "פירות"]
    }
  }
}
```

#### Get Weekly Menu
```
GET /restaurant/menu/weekly?startDate=2023-06-01
```

If startDate is not provided, returns the current week's menu.

**Response**: 200 OK
```json
{
  "startDate": "2023-06-01",
  "endDate": "2023-06-07",
  "menus": [
    { /* Daily menu for first day */ },
    { /* Daily menu for second day */ },
    /* ... */
  ]
}
```

### Activities

#### Get Activities List
```
GET /activities?date=2023-06-01
```

If date is not provided, returns today's activities.

**Response**: 200 OK
```json
{
  "date": "2023-06-01",
  "activities": [
    {
      "id": 1,
      "title": "התעמלות בוקר",
      "description": "פעילות התעמלות קלה לבוקר טוב",
      "location": "אולם התעמלות",
      "startTime": "09:00",
      "endTime": "10:00",
      "instructor": "רונית לוי"
    },
    {
      "id": 2,
      "title": "חוג אמנות",
      "description": "ציור בצבעי מים",
      "location": "חדר אמנות",
      "startTime": "11:00",
      "endTime": "12:30",
      "instructor": "דוד כהן"
    }
  ]
}
```

#### Get Weekly Activities
```
GET /activities/weekly?startDate=2023-06-01
```

If startDate is not provided, returns the current week's activities.

**Response**: 200 OK
```json
{
  "startDate": "2023-06-01",
  "endDate": "2023-06-07",
  "activities": [
    [/* Activities for first day */],
    [/* Activities for second day */],
    /* ... */
  ]
}
```

#### Get Activity Details
```
GET /activities/:activityId
```

**Response**: 200 OK
```json
{
  "id": 1,
  "title": "התעמלות בוקר",
  "description": "פעילות התעמלות קלה לבוקר טוב. מתאימה לכל הרמות וכוללת תרגילים לחיזוק השרירים ולשיפור הגמישות.",
  "location": "אולם התעמלות",
  "date": "2023-06-01",
  "startTime": "09:00",
  "endTime": "10:00",
  "instructor": "רונית לוי",
  "maxParticipants": 20,
  "currentParticipants": 12,
  "equipment": "נעלי ספורט נוחות, בקבוק מים",
  "imageUrl": "https://example.com/activities/morning-exercise.jpg"
}
```

#### Register for Activity
```
POST /activities/:activityId/register
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "נרשמת בהצלחה לפעילות",
  "registration": {
    "userId": 1,
    "activityId": 1,
    "registeredAt": "2023-05-30T12:00:00.000Z"
  }
}
```

#### Cancel Activity Registration
```
DELETE /activities/:activityId/register
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "ביטול הרשמה לפעילות בוצע בהצלחה"
}
```

### Messages

#### Get Messages
```
GET /messages
```

**Response**: 200 OK
```json
{
  "count": 2,
  "messages": [
    {
      "id": 1,
      "sender": {
        "id": 2,
        "name": "צוות רפואי"
      },
      "content": "תזכורת: פגישה עם דוקטור כהן מחר בשעה 10:00",
      "createdAt": "2023-05-30T12:00:00.000Z",
      "read": false
    },
    {
      "id": 2,
      "sender": {
        "id": 3,
        "name": "צוות פעילויות"
      },
      "content": "חוג האמנות של יום רביעי הקרוב בוטל",
      "createdAt": "2023-05-29T15:30:00.000Z",
      "read": true
    }
  ]
}
```

#### Get Message
```
GET /messages/:messageId
```

**Response**: 200 OK
```json
{
  "id": 1,
  "sender": {
    "id": 2,
    "name": "צוות רפואי"
  },
  "content": "תזכורת: פגישה עם דוקטור כהן מחר בשעה 10:00",
  "createdAt": "2023-05-30T12:00:00.000Z",
  "read": true,
  "readAt": "2023-05-30T14:00:00.000Z"
}
```

#### Mark Message as Read
```
PUT /messages/:messageId/read
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "הודעה סומנה כנקראה"
}
```

#### Send Message
```
POST /messages
```

**Request Body**:
```json
{
  "recipientId": 2,
  "content": "האם ניתן לקבוע תור לרופא השיניים?"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "הודעה נשלחה בהצלחה",
  "messageId": 3
}
```

### Medical

#### Get Medical Appointments
```
GET /medical/appointments
```

**Response**: 200 OK
```json
{
  "upcoming": [
    {
      "id": 1,
      "doctor": "ד״ר דוד כהן",
      "specialty": "רופא משפחה",
      "date": "2023-06-02",
      "time": "10:00",
      "location": "מרפאה, קומה 1",
      "notes": "ביקור שגרתי"
    }
  ],
  "past": [
    {
      "id": 2,
      "doctor": "ד״ר רונית לוי",
      "specialty": "קרדיולוגית",
      "date": "2023-05-15",
      "time": "14:30",
      "location": "מרפאה, קומה 2",
      "notes": "בדיקת מעקב",
      "summary": "לחץ דם תקין, דופק תקין. להמשיך טיפול נוכחי."
    }
  ]
}
```

#### Get Medical Appointment
```
GET /medical/appointments/:appointmentId
```

**Response**: 200 OK
```json
{
  "id": 1,
  "doctor": {
    "name": "ד״ר דוד כהן",
    "specialty": "רופא משפחה",
    "imageUrl": "https://example.com/doctors/davidcohen.jpg",
    "phoneNumber": "02-1234567"
  },
  "date": "2023-06-02",
  "time": "10:00",
  "duration": 20,
  "location": "מרפאה, קומה 1",
  "notes": "ביקור שגרתי",
  "preparationInstructions": "אין צורך בהכנה מיוחדת",
  "documents": []
}
```

#### Get Medical Records
```
GET /medical/records
```

**Response**: 200 OK
```json
{
  "allergies": ["פניצילין", "אגוזים"],
  "chronicConditions": ["יתר לחץ דם", "סוכרת מסוג 2"],
  "medications": [
    {
      "name": "רמיפריל",
      "dosage": "5 מ״ג",
      "frequency": "פעם ביום בבוקר",
      "purpose": "טיפול בלחץ דם"
    },
    {
      "name": "מטפורמין",
      "dosage": "850 מ״ג",
      "frequency": "פעמיים ביום",
      "purpose": "טיפול בסוכרת"
    }
  ],
  "recentTests": [
    {
      "id": 1,
      "type": "בדיקת דם",
      "date": "2023-05-10",
      "summary": "רמות סוכר תקינות, כולסטרול גבוה במקצת",
      "downloadUrl": "/api/medical/tests/1/download"
    }
  ]
}
```

### Swimming Pool

#### Get Pool Hours
```
GET /pool/hours
```

**Response**: 200 OK
```json
{
  "weekdays": {
    "morningSession": "07:00-09:00",
    "afternoonSession": "16:00-18:00"
  },
  "weekend": {
    "morningSession": "08:00-10:00",
    "afternoonSession": "15:00-17:00"
  },
  "specialHours": [
    {
      "date": "2023-06-05",
      "reason": "תחזוקה",
      "hours": "סגור"
    }
  ]
}
```

## Error Handling

All endpoints return standard error responses with the following structure:

```json
{
  "success": false,
  "message": "תיאור השגיאה",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

## Data Formats

### XML Menu Structure

The XML format for restaurant menus should follow this structure:

```xml
<menu date="2023-06-01">
  <meals>
    <breakfast>
      <mainDishes>
        <dish>חביתה</dish>
        <dish>חלה עם גבינות</dish>
        <dish>סלט ירקות</dish>
      </mainDishes>
      <sides>
        <dish>יוגורט</dish>
        <dish>גרנולה</dish>
        <dish>פירות</dish>
      </sides>
      <drinks>
        <drink>תה</drink>
        <drink>קפה</drink>
        <drink>מיץ תפוזים</drink>
      </drinks>
    </breakfast>
    <!-- Similar structure for lunch and dinner -->
  </meals>
</menu>
```

### XML Pool Hours Structure

The XML format for swimming pool hours should follow this structure:

```xml
<poolHours lastUpdated="2023-05-30">
  <weekdays>
    <session type="morning" hours="07:00-09:00" />
    <session type="afternoon" hours="16:00-18:00" />
  </weekdays>
  <weekend>
    <session type="morning" hours="08:00-10:00" />
    <session type="afternoon" hours="15:00-17:00" />
  </weekend>
  <specialHours>
    <day date="2023-06-05" reason="תחזוקה" hours="סגור" />
  </specialHours>
</poolHours>
```

## Versioning

The API is versioned through the URL path. The current version is v1:

```
/api/v1/resource
```

## Rate Limiting

To prevent abuse, the API implements rate limiting:

- 60 requests per minute for authenticated users
- 30 requests per minute for unauthenticated users

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1622550000
```

## WebSockets

Real-time updates for messages are available through WebSockets at:

```
ws://localhost:3000/ws
```

Events:
- `message` - New message received
- `activity_update` - Activity changes (cancellation, time change, etc.)
- `emergency_alert` - Facility-wide emergency notifications
