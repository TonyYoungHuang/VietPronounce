# Backend Skeleton

This backend is a file-based Node service for the mini program MVP.

It currently provides APIs for:

- content catalog and trial content
- mock login and phone binding
- redeem code validation and unlock
- dialect switching
- levels, lessons, and user progress
- weak-item aggregation
- basic admin APIs for content and redeem code management

Start it with:

```bash
cd backend
npm start
```

Default address:

- `http://127.0.0.1:4100`

Primary endpoints:

- `GET /health`
- `GET /api/catalog?dialect=north`
- `GET /api/trial?dialect=north`
- `POST /api/auth/mock-login`
- `POST /api/auth/bind-phone`
- `POST /api/redeem`
- `GET /api/user/state?userId=...`
- `POST /api/user/dialect`
- `GET /api/levels?userId=...&dialect=north`
- `GET /api/lessons?userId=...&dialect=north&levelId=beginner`
- `POST /api/progress/score`
- `GET /api/weakness?userId=...&dialect=north`
- `GET /api/admin/redeem-codes`
- `POST /api/admin/redeem-codes`
- `GET /api/admin/catalog`

Storage files are created under `backend/storage/` on first start.
