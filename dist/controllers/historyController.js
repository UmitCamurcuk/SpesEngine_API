"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.getEntityHistory = void 0;
const History_1 = __importDefault(require("../models/History"));
const mongoose_1 = __importDefault(require("mongoose"));
// Bir varlığın geçmişini getir
const getEntityHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { entityId } = req.params;
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Sıralama seçeneği
        const sortOption = {};
        if (req.query.sortBy) {
            sortOption[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sortOption.createdAt = -1; // Varsayılan olarak en yeni kayıtları başta göster
        }
        // History kayıtlarını getir
        const history = yield History_1.default.find({
            entityId: new mongoose_1.default.Types.ObjectId(entityId)
        })
            .populate('createdBy', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        // Toplam kayıt sayısını al
        const total = yield History_1.default.countDocuments({
            entityId: new mongoose_1.default.Types.ObjectId(entityId)
        });
        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Geçmiş kayıtları getirilirken bir hata oluştu'
        });
    }
});
exports.getEntityHistory = getEntityHistory;
// Genel geçmişi getir (entityType'a göre filtrelenebilir)
const getHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme
        const query = {};
        if (req.query.entityType) {
            query.entityType = req.query.entityType;
        }
        if (req.query.action) {
            query.action = req.query.action;
        }
        if (req.query.createdBy) {
            query.createdBy = new mongoose_1.default.Types.ObjectId(req.query.createdBy);
        }
        // Tarih aralığı filtreleme
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        // Sıralama seçeneği
        const sortOption = {};
        if (req.query.sortBy) {
            sortOption[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sortOption.createdAt = -1; // Varsayılan olarak en yeni kayıtları başta göster
        }
        // History kayıtlarını getir
        const history = yield History_1.default.find(query)
            .populate('createdBy', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        // Toplam kayıt sayısını al
        const total = yield History_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Geçmiş kayıtları getirilirken bir hata oluştu'
        });
    }
});
exports.getHistory = getHistory;
