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
exports.changeRelationshipStatus = exports.deleteRelationship = exports.updateRelationship = exports.getRelationshipsByType = exports.getRelationshipsByEntity = exports.getRelationshipById = exports.createRelationship = void 0;
const relationshipService_1 = __importDefault(require("../services/relationshipService"));
const errors_1 = require("../utils/errors");
// İlişki oluştur
const createRelationship = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kullanıcı ID'sini ekle
        if (!req.user || !req.user._id) {
            throw new errors_1.ValidationError('Kullanıcı kimliği bulunamadı');
        }
        const data = Object.assign(Object.assign({}, req.body), { createdBy: req.user._id, updatedBy: req.user._id });
        const relationship = yield relationshipService_1.default.create(data);
        res.status(201).json(relationship);
    }
    catch (error) {
        next(error);
    }
});
exports.createRelationship = createRelationship;
// ID'ye göre ilişkiyi getir
const getRelationshipById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const relationship = yield relationshipService_1.default.getById(id);
        res.status(200).json(relationship);
    }
    catch (error) {
        next(error);
    }
});
exports.getRelationshipById = getRelationshipById;
// Varlığa göre ilişkileri getir
const getRelationshipsByEntity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { entityType, entityId } = req.params;
        const { role = 'any' } = req.query;
        if (!['source', 'target', 'any'].includes(role)) {
            throw new errors_1.ValidationError('Geçersiz rol değeri. Rol "source", "target" veya "any" olmalıdır.');
        }
        const relationships = yield relationshipService_1.default.getByEntity(entityId, entityType, role);
        res.status(200).json(relationships);
    }
    catch (error) {
        next(error);
    }
});
exports.getRelationshipsByEntity = getRelationshipsByEntity;
// İlişki tipine göre ilişkileri getir
const getRelationshipsByType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { typeId } = req.params;
        const relationships = yield relationshipService_1.default.getByRelationshipType(typeId);
        res.status(200).json(relationships);
    }
    catch (error) {
        next(error);
    }
});
exports.getRelationshipsByType = getRelationshipsByType;
// İlişkiyi güncelle
const updateRelationship = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Boş veri kontrolü
        if (Object.keys(req.body).length === 0) {
            throw new errors_1.ValidationError('Güncelleme için en az bir alan gereklidir');
        }
        // Kullanıcı ID'sini ekle
        if (!req.user || !req.user._id) {
            throw new errors_1.ValidationError('Kullanıcı kimliği bulunamadı');
        }
        const data = Object.assign(Object.assign({}, req.body), { updatedBy: req.user._id });
        const relationship = yield relationshipService_1.default.update(id, data);
        res.status(200).json(relationship);
    }
    catch (error) {
        next(error);
    }
});
exports.updateRelationship = updateRelationship;
// İlişkiyi sil
const deleteRelationship = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield relationshipService_1.default.delete(id);
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
});
exports.deleteRelationship = deleteRelationship;
// İlişki durumunu değiştir
const changeRelationshipStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'pending', 'archived'].includes(status)) {
            throw new errors_1.ValidationError('Geçersiz durum değeri. Durum "active", "inactive", "pending" veya "archived" olmalıdır.');
        }
        if (!req.user || !req.user._id) {
            throw new errors_1.ValidationError('Kullanıcı kimliği bulunamadı');
        }
        const relationship = yield relationshipService_1.default.changeStatus(id, status, req.user._id.toString());
        res.status(200).json(relationship);
    }
    catch (error) {
        next(error);
    }
});
exports.changeRelationshipStatus = changeRelationshipStatus;
