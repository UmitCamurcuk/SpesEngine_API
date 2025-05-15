import { Request, Response } from 'express';
import Role from '../models/Role';
import Permission from '../models/Permission';

// @desc    Tüm rolleri getir
// @route   GET /api/roles
// @access  Private
export const getRoles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Role.countDocuments();
    const roles = await Role.find()
      .populate('permissions', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: roles.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      },
      roles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Roller getirilemedi',
      error: error.message
    });
  }
};

// @desc    Yeni bir rol oluştur
// @route   POST /api/roles
// @access  Private
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Rol zaten var mı kontrol et
    const existingRole = await Role.findOne({ name });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Bu isim ile bir rol zaten mevcut'
      });
    }

    // İzinler var mı kontrol et
    if (permissions && permissions.length > 0) {
      const permissionCount = await Permission.countDocuments({
        _id: { $in: permissions }
      });

      if (permissionCount !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Bazı izinler bulunamadı'
        });
      }
    }

    // Yeni rol oluştur
    const role = await Role.create({
      name,
      description,
      permissions: permissions || []
    });

    const populatedRole = await Role.findById(role._id).populate('permissions', 'name code');

    res.status(201).json({
      success: true,
      message: 'Rol başarıyla oluşturuldu',
      role: populatedRole
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol oluşturulamadı',
      error: error.message
    });
  }
};

// @desc    Belirli bir rolü getir
// @route   GET /api/roles/:id
// @access  Private
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions', 'name code description');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      role
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol getirilemedi',
      error: error.message
    });
  }
};

// @desc    Rolü güncelle
// @route   PUT /api/roles/:id
// @access  Private
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions, isActive } = req.body;

    // İsim değiştiriliyorsa, başka bir rol ile çakışıyor mu kontrol et
    if (name) {
      const existingRole = await Role.findOne({
        name,
        _id: { $ne: req.params.id }
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Bu isim ile başka bir rol zaten mevcut'
        });
      }
    }

    // İzinler değiştiriliyorsa, var mı kontrol et
    if (permissions && permissions.length > 0) {
      const permissionCount = await Permission.countDocuments({
        _id: { $in: permissions }
      });

      if (permissionCount !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Bazı izinler bulunamadı'
        });
      }
    }

    // Rolü güncelle
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('permissions', 'name code');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rol başarıyla güncellendi',
      role
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol güncellenemedi',
      error: error.message
    });
  }
};

// @desc    Rolü sil
// @route   DELETE /api/roles/:id
// @access  Private
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Rol başarıyla silindi'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol silinemedi',
      error: error.message
    });
  }
}; 