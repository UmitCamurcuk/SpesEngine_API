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
exports.deleteRelationshipType = exports.updateRelationshipType = exports.getRelationshipTypeById = exports.getAllRelationshipTypes = exports.createRelationshipType = void 0;
const relationshipTypeService_1 = __importDefault(require("../services/relationshipTypeService"));
const errors_1 = require("../utils/errors");
// İlişki tipi oluştur
const createRelationshipType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relationshipType = yield relationshipTypeService_1.default.create(req.body);
        res.status(201).json(relationshipType);
    }
    catch (error) {
        next(error);
    }
});
exports.createRelationshipType = createRelationshipType;
// Tüm ilişki tiplerini getir
const getAllRelationshipTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relationshipTypes = yield relationshipTypeService_1.default.getAll();
        res.status(200).json(relationshipTypes);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRelationshipTypes = getAllRelationshipTypes;
// ID'ye göre ilişki tipini getir
const getRelationshipTypeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const relationshipType = yield relationshipTypeService_1.default.getById(id);
        res.status(200).json(relationshipType);
    }
    catch (error) {
        next(error);
    }
});
exports.getRelationshipTypeById = getRelationshipTypeById;
// İlişki tipini güncelle
const updateRelationshipType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Boş veri kontrolü
        if (Object.keys(req.body).length === 0) {
            throw new errors_1.ValidationError('Güncelleme için en az bir alan gereklidir');
        }
        const relationshipType = yield relationshipTypeService_1.default.update(id, req.body);
        res.status(200).json(relationshipType);
    }
    catch (error) {
        next(error);
    }
});
exports.updateRelationshipType = updateRelationshipType;
// İlişki tipini sil
const deleteRelationshipType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield relationshipTypeService_1.default.delete(id);
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
});
exports.deleteRelationshipType = deleteRelationshipType;
