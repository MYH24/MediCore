import bcrypt from 'bcryptjs';

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  response: string;
  created_at: string;
}

interface Database {
  users: User[];
  chat_history: ChatMessage[];
  nextUserId: number;
  nextChatId: number;
}

// In-memory database for serverless environments
let inMemoryDb: Database | null = null;

function getDatabase(): Database {
  if (!inMemoryDb) {
    // Initialize with demo users
    inMemoryDb = {
      users: [
        {
          id: 1,
          email: 'demo@example.com',
          password: bcrypt.hashSync('demo123', 10),
          name: 'Demo User',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          email: 'test@example.com',
          password: bcrypt.hashSync('test123', 10),
          name: 'Test User',
          created_at: new Date().toISOString(),
        },
      ],
      chat_history: [],
      nextUserId: 3,
      nextChatId: 1,
    };
  }
  return inMemoryDb;
}

// User CRUD operations
export function createUser(email: string, password: string, name: string) {
  const db = getDatabase();
  
  // Check if email already exists
  if (db.users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: db.nextUserId++,
    email,
    password: hashedPassword,
    name,
    created_at: new Date().toISOString(),
  };
  
  db.users.push(newUser);
  
  return { id: newUser.id, email: newUser.email, name: newUser.name };
}

export function getUserByEmail(email: string) {
  const db = getDatabase();
  return db.users.find(u => u.email === email);
}

export function getUserById(id: number) {
  const db = getDatabase();
  const user = db.users.find(u => u.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return undefined;
}

export function updateUser(id: number, data: { name?: string; email?: string }) {
  const db = getDatabase();
  const userIndex = db.users.findIndex(u => u.id === id);
  
  if (userIndex === -1) return null;
  
  if (data.name) db.users[userIndex].name = data.name;
  if (data.email) {
    // Check if email is already taken by another user
    const existingUser = db.users.find(u => u.email === data.email && u.id !== id);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    db.users[userIndex].email = data.email;
  }
  
  return getUserById(id);
}

export function deleteUser(id: number) {
  const db = getDatabase();
  const userIndex = db.users.findIndex(u => u.id === id);
  
  if (userIndex === -1) return { changes: 0 };
  
  db.users.splice(userIndex, 1);
  // Also delete user's chat history
  db.chat_history = db.chat_history.filter(c => c.user_id !== id);
  
  return { changes: 1 };
}

export function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

// Chat history CRUD operations
export function createChatMessage(userId: number, message: string, response: string) {
  const db = getDatabase();
  
  const newMessage: ChatMessage = {
    id: db.nextChatId++,
    user_id: userId,
    message,
    response,
    created_at: new Date().toISOString(),
  };
  
  db.chat_history.push(newMessage);
  
  return { id: newMessage.id, userId, message, response };
}

export function getChatHistory(userId: number, limit = 50) {
  const db = getDatabase();
  return db.chat_history
    .filter(c => c.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function deleteChatMessage(id: number, userId: number) {
  const db = getDatabase();
  const initialLength = db.chat_history.length;
  db.chat_history = db.chat_history.filter(c => !(c.id === id && c.user_id === userId));
  return { changes: initialLength - db.chat_history.length };
}

export function clearChatHistory(userId: number) {
  const db = getDatabase();
  const initialLength = db.chat_history.length;
  db.chat_history = db.chat_history.filter(c => c.user_id !== userId);
  return { changes: initialLength - db.chat_history.length };
}
