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
exports.getItemTypeByCode = exports.getItemTypesForNavbar = exports.deleteItemType = exports.updateItemType = exports.createItemType = exports.getItemTypeById = exports.getItemTypes = void 0;
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
            .populate({
            path: 'name',
            select: 'key namespace translations'
        })
            .populate({
            path: 'description',
            select: 'key namespace translations'
        })
            .populate({
            path: 'category',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributes',
            select: 'name code type description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
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
        const itemType = yield ItemType_1.default.findById(req.params.id)
            .populate({
            path: 'name',
            select: 'key namespace translations'
        })
            .populate({
            path: 'description',
            select: 'key namespace translations'
        })
            .populate({
            path: 'category',
            select: 'name code description isActive',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'attributes',
                    select: 'name code type description isRequired isActive options validations',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'options',
                            select: 'name code type description isActive',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' }
                            ]
                        }
                    ]
                }
            ]
        })
            .populate({
            path: 'attributes',
            select: 'name code type description isRequired isActive options validations',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                }
            ]
        })
            .lean();
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        // Kategori hiyerarşisini ve family'leri populate et
        if (itemType.category) {
            const Category = require('../models/Category').default;
            const Family = require('../models/Family').default;
            // Alt kategorileri bul ve populate et
            const subcategories = yield Category.find({
                parent: itemType.category._id,
                isActive: true
            })
                .populate({ path: 'name', select: 'key namespace translations' })
                .populate({ path: 'description', select: 'key namespace translations' })
                .populate({
                path: 'attributeGroups',
                select: 'name code description attributes isActive',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' },
                    {
                        path: 'attributes',
                        select: 'name code type description isRequired isActive options validations',
                        populate: [
                            { path: 'name', select: 'key namespace translations' },
                            { path: 'description', select: 'key namespace translations' },
                            {
                                path: 'options',
                                select: 'name code type description isActive',
                                populate: [
                                    { path: 'name', select: 'key namespace translations' },
                                    { path: 'description', select: 'key namespace translations' }
                                ]
                            }
                        ]
                    }
                ]
            })
                .lean();
            // Ana kategorinin attribute groups'larını da populate et
            const mainCategory = yield Category.findById(itemType.category._id)
                .populate({
                path: 'attributeGroups',
                select: 'name code description attributes isActive',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' },
                    {
                        path: 'attributes',
                        select: 'name code type description isRequired isActive options validations',
                        populate: [
                            { path: 'name', select: 'key namespace translations' },
                            { path: 'description', select: 'key namespace translations' },
                            {
                                path: 'options',
                                select: 'name code type description isActive',
                                populate: [
                                    { path: 'name', select: 'key namespace translations' },
                                    { path: 'description', select: 'key namespace translations' }
                                ]
                            }
                        ]
                    }
                ]
            })
                .lean();
            if (mainCategory) {
                itemType.category = mainCategory;
            }
            itemType.category.subcategories = subcategories;
            // Recursive function to get families for a category, including subfamilies
            const getAllFamiliesForCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
                const families = yield Family.find({
                    category: categoryId,
                    isActive: true
                })
                    .populate({ path: 'name', select: 'key namespace translations' })
                    .populate({ path: 'description', select: 'key namespace translations' })
                    .populate({ path: 'parent', select: 'name code description isActive' })
                    .populate({
                    path: 'attributeGroups',
                    select: 'name code description attributes isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options validations',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                    .populate({
                    path: 'subFamilies',
                    select: 'name code description attributeGroups isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributeGroups',
                            select: 'name code description attributes isActive',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'attributes',
                                    select: 'name code type description isRequired isActive options validations',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' },
                                        {
                                            path: 'options',
                                            select: 'name code type description isActive',
                                            populate: [
                                                { path: 'name', select: 'key namespace translations' },
                                                { path: 'description', select: 'key namespace translations' }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                    .lean();
                return families;
            });
            // Ana kategorinin families'lerini bul ve populate et
            const families = yield getAllFamiliesForCategory(String(itemType.category._id));
            console.log(`Ana kategori ${itemType.category._id} için bulunan families:`, families.length);
            itemType.category.families = families;
            // Alt kategorilerin families'lerini de bul
            for (const subcat of subcategories) {
                const subcatFamilies = yield getAllFamiliesForCategory(String(subcat._id));
                console.log(`Alt kategori ${subcat._id} (${subcat.code}) için bulunan families:`, subcatFamilies.length);
                subcat.families = subcatFamilies;
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
        // Eğer attributeGroups seçilmişse, bunlara ait attributes'ları otomatik ekle
        if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
            const Attribute = require('../models/Attribute').default;
            // Seçilen AttributeGroup'lara ait tüm attribute'ları bul
            const attributes = yield Attribute.find({
                attributeGroup: { $in: req.body.attributeGroups }
            }).select('_id').lean();
            // Bulunan attribute ID'lerini req.body'ye ekle
            req.body.attributes = attributes.map((attr) => attr._id);
        }
        const itemType = yield ItemType_1.default.create(req.body);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.ITEM_TYPE,
                    entityId: String(itemType._id),
                    entityName: itemType.code, // name ObjectId olduğu için code kullanıyoruz
                    action: History_1.ActionType.CREATE,
                    userId: userId,
                    newData: {
                        name: String(itemType.name),
                        code: itemType.code,
                        description: String(itemType.description),
                        category: String(itemType.category),
                        attributeGroups: (itemType.attributeGroups || []).map(id => String(id)),
                        attributes: (itemType.attributes || []).map(id => String(id)),
                        isActive: itemType.isActive
                    }
                });
            }
            catch (historyError) {
                console.error('History creation failed for itemType:', historyError);
                // History hatası oluşturma işlemini engellemesin
            }
        }
        // Oluşturulan öğe tipini tüm alanlarıyla birlikte getir
        const newItemType = yield ItemType_1.default.findById(itemType._id)
            .populate({
            path: 'name',
            select: 'key namespace translations'
        })
            .populate({
            path: 'description',
            select: 'key namespace translations'
        })
            .populate({
            path: 'category',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributes',
            select: 'name code type description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        });
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
        // Güncellemeden önceki veriyi al
        const oldItemType = yield ItemType_1.default.findById(req.params.id);
        if (!oldItemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        const itemType = yield ItemType_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate({
            path: 'name',
            select: 'key namespace translations'
        }).populate({
            path: 'description',
            select: 'key namespace translations'
        }).populate({
            path: 'category',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        }).populate({
            path: 'attributeGroups',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        }).populate({
            path: 'attributes',
            select: 'name code type description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        });
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'Öğe tipi bulunamadı'
            });
            return;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                // Sadece değişen alanları history'e kaydet
                const historyData = {
                    entityType: Entity_1.EntityType.ITEM_TYPE,
                    entityId: String(itemType._id),
                    entityName: itemType.code,
                    action: History_1.ActionType.UPDATE,
                    userId: userId
                };
                // Comment varsa ekle
                if (req.body.comment) {
                    historyData.comment = req.body.comment;
                }
                // Sadece request body'de gelen (değişen) alanları kaydet
                const previousData = {};
                const newData = {};
                // req.body'de gelen her alan için eski ve yeni değerleri kaydet
                Object.keys(req.body).forEach(key => {
                    if (key !== 'comment') { // comment alanını data'ya dahil etme
                        if (key === 'attributeGroups' || key === 'attributes') {
                            previousData[key] = (oldItemType[key] || []).map((id) => String(id));
                            newData[key] = (req.body[key] || []).map((id) => String(id));
                        }
                        else if (key === 'name' || key === 'description' || key === 'category') {
                            previousData[key] = String(oldItemType[key]);
                            newData[key] = String(req.body[key]);
                        }
                        else if (key === 'settings') {
                            previousData[key] = oldItemType[key] || {};
                            newData[key] = req.body[key];
                        }
                        else {
                            previousData[key] = oldItemType[key];
                            newData[key] = req.body[key];
                        }
                    }
                });
                historyData.previousData = previousData;
                historyData.newData = newData;
                yield historyService_1.default.recordHistory(historyData);
            }
            catch (historyError) {
                console.error('History update failed for itemType:', historyError);
                // History hatası güncelleme işlemini engellemesin
            }
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
                    entityName: itemType.code,
                    action: History_1.ActionType.DELETE,
                    userId: userId,
                    previousData: {
                        name: String(itemType.name),
                        code: itemType.code,
                        description: String(itemType.description),
                        category: String(itemType.category),
                        attributeGroups: (itemType.attributeGroups || []).map(id => String(id)),
                        attributes: (itemType.attributes || []).map(id => String(id)),
                        isActive: itemType.isActive
                    }
                });
            }
            catch (historyError) {
                console.error('History deletion failed for itemType:', historyError);
                // History hatası silme işlemini engellemesin
            }
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(req.params.id);
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
// GET navbar için aktif öğe tiplerini getir
const getItemTypesForNavbar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemTypes = yield ItemType_1.default.find({
            isActive: true,
            'settings.navigation.showInNavbar': true
        })
            .populate({
            path: 'name',
            select: 'key namespace translations'
        })
            .sort({ 'settings.navigation.navbarOrder': 1, name: 1 });
        res.status(200).json({
            success: true,
            data: itemTypes
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Navbar öğe tipleri getirilirken bir hata oluştu'
        });
    }
});
exports.getItemTypesForNavbar = getItemTypesForNavbar;
// GET code'a göre ItemType getir (attribute bilgileri ile birlikte)
const getItemTypeByCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        const itemType = yield ItemType_1.default.findOne({ code })
            .populate({
            path: 'name',
            select: 'key namespace translations'
        })
            .populate({
            path: 'description',
            select: 'key namespace translations'
        })
            .populate({
            path: 'category',
            select: 'name code description isActive',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'attributes',
                    select: 'name code type description isRequired isActive options validations',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'options',
                            select: 'name code type description isActive',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' }
                            ]
                        }
                    ]
                }
            ]
        })
            .populate({
            path: 'attributes',
            select: 'name code type description isRequired isActive options validations',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                }
            ]
        })
            .lean();
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
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe tipi getirilirken bir hata oluştu'
        });
    }
});
exports.getItemTypeByCode = getItemTypeByCode;
exports.default = {
    getItemTypes: exports.getItemTypes,
    getItemTypeById: exports.getItemTypeById,
    createItemType: exports.createItemType,
    updateItemType: exports.updateItemType,
    deleteItemType: exports.deleteItemType,
    getItemTypesForNavbar: exports.getItemTypesForNavbar,
    getItemTypeByCode: exports.getItemTypeByCode
};
