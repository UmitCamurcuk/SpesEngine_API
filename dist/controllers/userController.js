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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
// Tüm kullanıcıları getir
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().populate('role');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar getirilemedi',
            error: error.message
        });
    }
});
exports.getUsers = getUsers;
// Tek bir kullanıcıyı getir
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).populate('role');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı getirilemedi',
            error: error.message
        });
    }
});
exports.getUser = getUser;
// Kullanıcı oluştur
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kullanıcı oluşturulamadı',
            error: error.message
        });
    }
});
exports.createUser = createUser;
// Kullanıcı güncelle
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kullanıcı güncellenemedi',
            error: error.message
        });
    }
});
exports.updateUser = updateUser;
// Kullanıcı sil
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinemedi',
            error: error.message
        });
    }
});
exports.deleteUser = deleteUser;
