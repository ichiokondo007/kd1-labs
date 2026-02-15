import express from 'express';
import { User, ApiResponse } from '@kd1-labs/types'; // ★共有型をインポート

const app = express();

app.get('/api/me', (req, res) => {
  const user: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@kd1labs.com',
    role: 'admin'
  };
  
  const response: ApiResponse<User> = {
    success: true,
    data: user
  };

  res.json(response);
});
