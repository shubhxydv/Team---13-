# UrbanEase Team Detail Feature

## About

The Team Detail feature manages Team 13 member information inside UrbanEase. It lets users add a team member, upload a member photo, view all members in a card layout, and open a single member profile with full details.

## Tech Stack Used

- Frontend: React, Vite, React Router DOM, Tailwind CSS, Lucide React
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- File Upload: Multer
- API Communication: Fetch API
- Styling: Shared React page styles in `client/src/pages/teamPageStyles.js`

## Feature Description

- Team detail landing page shows Team 13 management options.
- Add member page collects name, roll number, year, degree, project details, hobbies, certificate, internship, aim, and photo.
- View members page shows all saved team members with their photo, bold name, roll number, and a view details button.
- Member details page shows the selected member photo and complete profile information.
- Uploaded photos are shown in full ratio using `object-fit: contain`, so the complete image is visible.

## Functioning

1. User opens `/team`.
2. User clicks **Add Member** and fills the member form.
3. The form sends a `POST` request to `POST /api/members` with `multipart/form-data`.
4. Multer saves the uploaded image in the backend uploads folder.
5. Member data and image metadata are saved in MongoDB.
6. User opens `/team/members` to fetch all members from `GET /api/members`.
7. User clicks **View Details** to open `/team/members/:id`, which fetches data from `GET /api/members/:id`.

## Important Paths

- Team routes: `client/src/App.jsx`
- Team landing page: `client/src/pages/TeamPage.jsx`
- Add member page: `client/src/pages/AddMemberPage.jsx`
- View members page: `client/src/pages/ViewMembersPage.jsx`
- Single member details page: `client/src/pages/MemberDetailsPage.jsx`
- Team shared styles: `client/src/pages/teamPageStyles.js`
- Member API routes: `server/routes/members.js`
- Member database model: `server/models/Member.js`
- Server static upload route: `server/server.js`

## Image Path

- Uploaded image storage folder: `server/uploads/`
- Image metadata field in MongoDB: `document`
- Public image URL format: `http://localhost:5000/uploads/<filename>`
- Frontend image URL is created from the API server URL by removing `/api` and appending `/uploads/<filename>`.

Example:

```txt
server/uploads/1713700000000-member-photo.jpg
http://localhost:5000/uploads/1713700000000-member-photo.jpg
```

## API Endpoints

- `POST /api/members` - Add a new member with optional image upload.
- `GET /api/members` - Get all team members.
- `GET /api/members/:id` - Get one member by ID.

