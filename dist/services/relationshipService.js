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
const Relationship_1 = __importDefault(require("../models/Relationship"));
const RelationshipType_1 = __importDefault(require("../models/RelationshipType"));
const errors_1 = require("../utils/errors");
const mongoose_1 = __importDefault(require("mongoose"));
class RelationshipService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // İlişki tipini kontrol et
            const relationshipType = yield RelationshipType_1.default.findById(data.relationshipTypeId);
            if (!relationshipType) {
                throw new errors_1.ValidationError('Geçersiz ilişki tipi');
            }
            // Kaynak ve hedef türlerinin izin verilen türler olduğunu kontrol et
            if (data.sourceEntityType && !relationshipType.allowedSourceTypes.includes(data.sourceEntityType)) {
                throw new errors_1.ValidationError(`${data.sourceEntityType} ilişki tipi için kaynak olarak kullanılamaz`);
            }
            if (data.targetEntityType && !relationshipType.allowedTargetTypes.includes(data.targetEntityType)) {
                throw new errors_1.ValidationError(`${data.targetEntityType} ilişki tipi için hedef olarak kullanılamaz`);
            }
            // İlişkiyi oluştur
            const relationship = new Relationship_1.default(data);
            return yield relationship.save();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const relationship = yield Relationship_1.default.findById(id)
                .populate('relationshipTypeId')
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');
            if (!relationship) {
                throw new errors_1.NotFoundError('İlişki bulunamadı');
            }
            return relationship;
        });
    }
    getByEntity(entityId_1, entityType_1) {
        return __awaiter(this, arguments, void 0, function* (entityId, entityType, role = 'any') {
            const query = { status: 'active' };
            if (role === 'source' || role === 'any') {
                query.sourceEntityId = new mongoose_1.default.Types.ObjectId(entityId);
                query.sourceEntityType = entityType;
            }
            if (role === 'target' || role === 'any') {
                if (role === 'any') {
                    query.$or = [
                        { sourceEntityId: new mongoose_1.default.Types.ObjectId(entityId), sourceEntityType: entityType },
                        { targetEntityId: new mongoose_1.default.Types.ObjectId(entityId), targetEntityType: entityType }
                    ];
                    delete query.sourceEntityId;
                    delete query.sourceEntityType;
                }
                else {
                    query.targetEntityId = new mongoose_1.default.Types.ObjectId(entityId);
                    query.targetEntityType = entityType;
                }
            }
            return yield Relationship_1.default.find(query)
                .populate('relationshipTypeId')
                .sort({ priority: -1, createdAt: -1 });
        });
    }
    getByRelationshipType(relationshipTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Relationship_1.default.find({
                relationshipTypeId,
                status: 'active'
            }).sort({ priority: -1, createdAt: -1 });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // İlişki türü değiştiyse yeniden kontrol et
            if (data.relationshipTypeId || data.sourceEntityType || data.targetEntityType) {
                const relationship = yield Relationship_1.default.findById(id);
                if (!relationship) {
                    throw new errors_1.NotFoundError('İlişki bulunamadı');
                }
                const typeId = data.relationshipTypeId || relationship.relationshipTypeId;
                const sourceType = data.sourceEntityType || relationship.sourceEntityType;
                const targetType = data.targetEntityType || relationship.targetEntityType;
                const relationshipType = yield RelationshipType_1.default.findById(typeId);
                if (!relationshipType) {
                    throw new errors_1.ValidationError('Geçersiz ilişki tipi');
                }
                if (!relationshipType.allowedSourceTypes.includes(sourceType)) {
                    throw new errors_1.ValidationError(`${sourceType} ilişki tipi için kaynak olarak kullanılamaz`);
                }
                if (!relationshipType.allowedTargetTypes.includes(targetType)) {
                    throw new errors_1.ValidationError(`${targetType} ilişki tipi için hedef olarak kullanılamaz`);
                }
            }
            const relationship = yield Relationship_1.default.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
            if (!relationship) {
                throw new errors_1.NotFoundError('İlişki bulunamadı');
            }
            return relationship;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Relationship_1.default.findByIdAndDelete(id);
            if (!result) {
                throw new errors_1.NotFoundError('İlişki bulunamadı');
            }
        });
    }
    changeStatus(id, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const relationship = yield Relationship_1.default.findByIdAndUpdate(id, {
                $set: {
                    status,
                    updatedBy: new mongoose_1.default.Types.ObjectId(userId)
                }
            }, { new: true });
            if (!relationship) {
                throw new errors_1.NotFoundError('İlişki bulunamadı');
            }
            return relationship;
        });
    }
}
exports.default = new RelationshipService();
