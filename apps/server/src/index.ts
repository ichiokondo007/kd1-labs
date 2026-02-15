import express from 'express';
import cors from 'cors';
import { User, ApiResponse } from '@kd1-labs/types'; // ★共有型をインポート

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------------
// 仮データ（モック）: 本番では MySQL + passport + express-session に置換
// -------------------------------------------------------------------
interface MockUser {
  userId: string;
  loginName: string;
  mailAddress: string | null;
  password: string;
  isInitialPassword: boolean;
}

const mockUsers: MockUser[] = [
  {
    userId: '1',
    loginName: 'admin',
    mailAddress: 'admin@kd1labs.com',
    password: 'password',
    isInitialPassword: true,
  },
  {
    userId: '2',
    loginName: 'user1',
    mailAddress: null,
    password: 'changed123',
    isInitialPassword: false,
  },
];

// 簡易セッション管理（モック）: 本番では express-session + express-mysql-session に置換
let currentSession: { userId: string } | null = null;

// -------------------------------------------------------------------
// 認証API
// -------------------------------------------------------------------

// ログイン
app.post('/api/auth/login', (req, res) => {
  const { loginName, password } = req.body;

  const user = mockUsers.find(
    (u) => u.loginName === loginName && u.password === password
  );

  if (!user) {
    res.status(401).json({ success: false, message: 'ログインIDまたはパスワードが正しくありません' });
    return;
  }

  currentSession = { userId: user.userId };

  res.json({
    success: true,
    data: {
      id: user.userId,
      loginName: user.loginName,
      mailAddress: user.mailAddress,
      isInitialPassword: user.isInitialPassword,
    },
  });
});

// セッション確認
app.get('/api/auth/me', (req, res) => {
  if (!currentSession) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const user = mockUsers.find((u) => u.userId === currentSession!.userId);
  if (!user) {
    currentSession = null;
    res.status(401).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.userId,
      loginName: user.loginName,
      mailAddress: user.mailAddress,
      isInitialPassword: user.isInitialPassword,
    },
  });
});

// パスワード変更（初期パスワード変更）
app.post('/api/auth/password-change', (req, res) => {
  if (!currentSession) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  const user = mockUsers.find((u) => u.userId === currentSession!.userId);

  if (!user) {
    res.status(401).json({ success: false, message: 'User not found' });
    return;
  }

  if (user.password !== currentPassword) {
    res.status(400).json({ success: false, message: '現在のパスワードが正しくありません' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'パスワードは8文字以上にしてください' });
    return;
  }

  // パスワード更新 & is_initial_password フラグをOFF
  user.password = newPassword;
  user.isInitialPassword = false;

  res.json({
    success: true,
    data: {
      id: user.userId,
      loginName: user.loginName,
      mailAddress: user.mailAddress,
      isInitialPassword: user.isInitialPassword,
    },
  });
});

// ログアウト
app.post('/api/auth/logout', (_req, res) => {
  currentSession = null;
  res.json({ success: true });
});

// -------------------------------------------------------------------
// 既存の /api/me エンドポイント（互換性維持）
// -------------------------------------------------------------------
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
