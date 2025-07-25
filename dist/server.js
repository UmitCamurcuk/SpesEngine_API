"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = __importDefault(require("./config/database"));
const i18n_1 = require("./middleware/i18n");
// Route dosyalarını import et
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const attributeRoutes_1 = __importDefault(require("./routes/attributeRoutes"));
const attributeGroupRoutes_1 = __importDefault(require("./routes/attributeGroupRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const familyRoutes_1 = __importDefault(require("./routes/familyRoutes"));
const itemTypeRoutes_1 = __importDefault(require("./routes/itemTypeRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const historyRoutes_1 = __importDefault(require("./routes/historyRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const permissionRoutes_1 = __importDefault(require("./routes/permissionRoutes"));
const permissionGroupRoutes_1 = __importDefault(require("./routes/permissionGroupRoutes"));
const localizationRoutes_1 = __importDefault(require("./routes/localizationRoutes"));
const relationshipRoutes_1 = __importDefault(require("./routes/relationshipRoutes"));
const relationshipTypeRoutes_1 = __importDefault(require("./routes/relationshipTypeRoutes"));
const systemSettingsRoutes_1 = __importDefault(require("./routes/systemSettingsRoutes"));
// Env değişkenlerini yükle
dotenv_1.default.config();
// JWT gizli anahtarını kontrol et
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'gizli_anahtar_abc123';
    console.warn('JWT_SECRET çevre değişkeni ayarlanmamış, varsayılan değer kullanılıyor!');
}
// MongoDB bağlantısı
(0, database_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 1903;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Frontend URL'leri
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Çeviri middleware'lerini ekle
app.use(i18n_1.getTranslationsMiddleware);
app.use(i18n_1.translateEntityMiddleware);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/attributes', attributeRoutes_1.default);
app.use('/api/attributeGroups', attributeGroupRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/families', familyRoutes_1.default);
app.use('/api/ItemTypes', itemTypeRoutes_1.default);
app.use('/api/items', itemRoutes_1.default);
app.use('/api/roles', roleRoutes_1.default);
app.use('/api/permissions', permissionRoutes_1.default);
app.use('/api/permissionGroups', permissionGroupRoutes_1.default);
app.use('/api/localizations', localizationRoutes_1.default);
app.use('/api/history', historyRoutes_1.default);
app.use('/api/relationships', relationshipRoutes_1.default);
app.use('/api/relationship-types', relationshipTypeRoutes_1.default);
app.use('/api/system', systemSettingsRoutes_1.default);
// Ana route
app.get('/', (req, res) => {
    res.send('SpesEngine API çalışıyor');
});
// Debug route
app.get('/api/debug', (req, res) => {
    res.json({
        success: true,
        message: 'Debug endpoint çalışıyor',
        headers: req.headers,
        path: req.path
    });
});
// Server'ı başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
