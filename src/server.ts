import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database';
import { getTranslationsMiddleware, translateEntityMiddleware } from './middleware/i18n';

// Route dosyalarını import et
import authRoutes from './routes/authRoutes';
import attributeRoutes from './routes/attributeRoutes';
import attributeGroupRoutes from './routes/attributeGroupRoutes';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';
import familyRoutes from './routes/familyRoutes';
import itemTypeRoutes from './routes/itemTypeRoutes';
import itemRoutes from './routes/itemRoutes';
import historyRoutes from './routes/historyRoutes';
import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import permissionGroupRoutes from './routes/permissionGroupRoutes';
import localizationRoutes from './routes/localizationRoutes';

// Env değişkenlerini yükle
dotenv.config();

// JWT gizli anahtarını kontrol et
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'gizli_anahtar_abc123';
  console.warn('JWT_SECRET çevre değişkeni ayarlanmamış, varsayılan değer kullanılıyor!');
}

// MongoDB bağlantısı
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 1903;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],  // Frontend URL'leri
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Çeviri middleware'lerini ekle
app.use(getTranslationsMiddleware);
app.use(translateEntityMiddleware);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/attributeGroups', attributeGroupRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/itemTypes', itemTypeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/permissionGroups', permissionGroupRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/localizations', localizationRoutes);

// Ana route
app.get('/', (req: Request, res: Response) => {
  res.send('SpesEngine API çalışıyor');
});

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 