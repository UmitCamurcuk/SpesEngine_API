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
exports.deleteItemType = exports.updateItemType = exports.createItemType = exports.getItemTypeById = exports.getItemTypes = void 0;
const ItemType_1 = __importDefault(require("../models/ItemType"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
const Entity_1 = require("../models/Entity");
// GET tüm öğe tiplerini getir
const getItemTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = {};
        // isActive parametresi
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        // Arama parametresi (name ve code alanlarında)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filterParams.$or = [
                { name: searchRegex },
                { code: searchRegex }
            ];
        }
        // Sıralama parametreleri
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;
        // Toplam kayıt sayısını al
        const total = yield ItemType_1.default.countDocuments(filterParams);
        // Verileri getir
        const itemTypes = yield ItemType_1.default.find(filterParams)
            .populate('attributes')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        // Sayfa sayısını hesapla
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            count: itemTypes.length,
            total,
            page,
            pages,
            data: itemTypes
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe tipleri getirilirken bir hata oluştu'
        });
    }
});
exports.getItemTypes = getItemTypes;
// GET tek bir öğe tipini getir
const getItemTypeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query parametrelerini al
        const includeAttributes = req.query.includeAttributes === 'true';
        const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
        const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
        // Temel ItemType sorgusu
        const itemType = yield ItemType_1.default.findById(req.params.id).lean();
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        // Attributes'ları include et
        if (includeAttributes) {
            const attributes = yield ItemType_1.default.findById(req.params.id)
                .populate('attributes')
                .lean()
                .then(result => (result === null || result === void 0 ? void 0 : result.attributes) || []);
            itemType.attributes = attributes;
        }
        // AttributeGroups'ları include et
        if (includeAttributeGroups) {
            // populateAttributeGroupsAttributes=true ise attribute'ları da içeren sorgu kullan
            if (populateAttributeGroupsAttributes) {
                const itemTypeWithGroups = yield ItemType_1.default.findById(req.params.id)
                    .populate({
                    path: 'attributeGroups',
                    populate: {
                        path: 'attributes'
                    }
                })
                    .lean();
                itemType.attributeGroups = (itemTypeWithGroups === null || itemTypeWithGroups === void 0 ? void 0 : itemTypeWithGroups.attributeGroups) || [];
            }
            else {
                // AttributeGroups'ları getir
                const attributeGroups = yield ItemType_1.default.findById(req.params.id)
                    .populate('attributeGroups')
                    .lean()
                    .then(result => (result === null || result === void 0 ? void 0 : result.attributeGroups) || []);
                // Her bir AttributeGroup için, ilgili attribute'ları bulup ata
                if (attributeGroups.length > 0 && includeAttributes) {
                    // Tüm ilgili attribute'ları tek bir sorguda getir
                    const allAttributes = yield ItemType_1.default.findById(req.params.id)
                        .populate('attributes')
                        .lean()
                        .then(result => (result === null || result === void 0 ? void 0 : result.attributes) || []);
                    // Her AttributeGroup için, ona ait attribute'ları filtrele ve ata
                    for (const group of attributeGroups) {
                        // Bu gruba ait attribute'ları filtrele
                        const groupAttributes = allAttributes.filter((attr) => attr.attributeGroup && attr.attributeGroup.toString() === group._id.toString());
                        // AttributeGroup'a ait attribute'ları ata
                        group.attributes = groupAttributes;
                    }
                }
                itemType.attributeGroups = attributeGroups;
            }
        }
        res.status(200).json({
            success: true,
            data: itemType
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe tipi getirilirken bir hata oluştu'
        });
    }
});
exports.getItemTypeById = getItemTypeById;
// POST yeni öğe tipi oluştur
const createItemType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemType = yield ItemType_1.default.create(req.body);
        // Oluşturulan öğe tipini attribute alanlarıyla birlikte getir
        const newItemType = yield ItemType_1.default.findById(itemType._id)
            .populate('attributes');
        res.status(201).json({
            success: true,
            data: newItemType
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öğe tipi oluşturulurken bir hata oluştu'
        });
    }
});
exports.createItemType = createItemType;
// PUT öğe tipini güncelle
const updateItemType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemType = yield ItemType_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('attributes');
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: itemType
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öğe tipi güncellenirken bir hata oluştu'
        });
    }
});
exports.updateItemType = updateItemType;
// DELETE öğe tipini sil
const deleteItemType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Silinmeden önce veriyi al
        const itemType = yield ItemType_1.default.findById(req.params.id);
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        // Veriyi sil
        yield ItemType_1.default.findByIdAndDelete(req.params.id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.ITEM_TYPE,
                    entityId: String(itemType._id),
                    entityName: itemType.name,
                    action: History_1.ActionType.DELETE,
                    userId: userId,
                    previousData: {
                        name: itemType.name,
                        code: itemType.code,
                        description: itemType.description || '',
                        isActive: itemType.isActive
                    }
                });
                console.log('ItemType deletion history saved successfully');
            }
            catch (historyError) {
                console.error('History deletion failed for itemType:', historyError);
                // History hatası silme işlemini engellemesin
            }
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(req.params.id);
            console.log(`Deleted ${deletedHistoryCount} history records for itemType ${req.params.id}`);
        }
        catch (historyError) {
            console.error('Error deleting itemType history:', historyError);
            // History silme hatası ana işlemi engellemesin
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öğe tipi silinirken bir hata oluştu'
        });
    }
});
exports.deleteItemType = deleteItemType;
