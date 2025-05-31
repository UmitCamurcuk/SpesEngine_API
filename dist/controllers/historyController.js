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
exports.getEntityHistory = exports.getHistory = void 0;
const historyService_1 = __importDefault(require("../services/historyService"));
// GET tüm history kayıtlarını getir
const getHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const entityType = req.query.entityType;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        // History service'den genel history'yi getir
        const result = yield historyService_1.default.getAllHistory(entityType, limit, skip, startDate, endDate);
        const pages = Math.ceil(result.total / limit);
        res.status(200).json({
            success: true,
            count: result.histories.length,
            total: result.total,
            page,
            limit,
            pages,
            data: result.histories
        });
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'History kayıtları getirilirken bir hata oluştu'
        });
    }
});
exports.getHistory = getHistory;
// GET belirli entity'nin history kayıtlarını getir
const getEntityHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { entityId } = req.params;
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const entityType = req.query.entityType;
        const result = yield historyService_1.default.getEntityHistory(entityId, entityType, limit, skip);
        const pages = Math.ceil(result.total / limit);
        res.status(200).json({
            success: true,
            count: result.histories.length,
            total: result.total,
            page,
            limit,
            pages,
            data: result.histories
        });
    }
    catch (error) {
        console.error('Error fetching entity history:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Entity history kayıtları getirilirken bir hata oluştu'
        });
    }
});
exports.getEntityHistory = getEntityHistory;
