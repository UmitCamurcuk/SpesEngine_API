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
exports.deleteAttributeGroup = exports.updateAttributeGroup = exports.createAttributeGroup = exports.getAttributeGroupById = exports.getAttributeGroups = void 0;
const AttributeGroup_1 = __importDefault(require("../models/AttributeGroup"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
// GET tüm öznitelik gruplarını getir
const getAttributeGroups = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Filtreleme parametrelerini alma
        const filterParams = {};
        // isActive parametresi
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        const attributeGroups = yield AttributeGroup_1.default.find(filterParams)
            .populate('attributes')
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        res.status(200).json({
            success: true,
            count: attributeGroups.length,
            data: attributeGroups
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik grupları getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributeGroups = getAttributeGroups;
// GET tek bir öznitelik grubunu getir
const getAttributeGroupById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attributeGroup = yield AttributeGroup_1.default.findById(req.params.id)
            .populate('attributes')
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: attributeGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik grubu getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributeGroupById = getAttributeGroupById;
// POST yeni öznitelik grubu oluştur
const createAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attributeGroup = yield AttributeGroup_1.default.create(req.body);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: String(attributeGroup._id),
                entityType: 'attributeGroup',
                entityName: String(attributeGroup.name),
                action: History_1.ActionType.CREATE,
                userId: userId,
                newData: attributeGroup.toObject()
            });
        }
        res.status(201).json({
            success: true,
            data: attributeGroup
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu oluşturulurken bir hata oluştu'
        });
    }
});
exports.createAttributeGroup = createAttributeGroup;
// PUT öznitelik grubunu güncelle
const updateAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Güncelleme öncesi mevcut veriyi al (geçmiş için)
        const previousAttributeGroup = yield AttributeGroup_1.default.findById(req.params.id);
        if (!previousAttributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        const attributeGroup = yield AttributeGroup_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('attributes');
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: req.params.id,
                entityType: 'attributeGroup',
                entityName: String(attributeGroup.name || previousAttributeGroup.name),
                action: History_1.ActionType.UPDATE,
                userId: userId,
                previousData: previousAttributeGroup.toObject(),
                newData: attributeGroup.toObject()
            });
        }
        res.status(200).json({
            success: true,
            data: attributeGroup
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu güncellenirken bir hata oluştu'
        });
    }
});
exports.updateAttributeGroup = updateAttributeGroup;
// DELETE öznitelik grubunu sil
const deleteAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Silme öncesi veriyi al (geçmiş için)
        const attributeGroup = yield AttributeGroup_1.default.findById(req.params.id);
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        // Veriyi sil
        yield AttributeGroup_1.default.findByIdAndDelete(req.params.id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: req.params.id,
                entityType: 'attributeGroup',
                entityName: String(attributeGroup.name),
                action: History_1.ActionType.DELETE,
                userId: userId,
                previousData: attributeGroup.toObject()
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu silinirken bir hata oluştu'
        });
    }
});
exports.deleteAttributeGroup = deleteAttributeGroup;
