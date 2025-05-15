import { Request, Response } from 'express';
import Permission from '../models/Permission';
import PermissionGroup from '../models/PermissionGroup';

// @desc    Tüm izinleri getir
// @route   GET /api/permissions
// @access  Private
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Permission.countDocuments();
    const permissions = await Permission.find()
      .populate('permissionGroup', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: permissions.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      },
      permissions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzinler getirilemedi',
      error: error.message
    });
  }
};

// @desc    Yeni bir izin oluştur
// @route   POST /api/permissions
// @access  Private
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, description, code, permissionGroup } = req.body;

    // İzin zaten var mı kontrol et
    const existingPermission = await Permission.findOne({
      $or: [{ name }, { code }]
    });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Bu isim veya kod ile bir izin zaten mevcut'
      });
    }

    // İzin grubu var mı kontrol et
    const groupExists = await PermissionGroup.findById(permissionGroup);
    if (!groupExists) {
      return res.status(400).json({
        success: false,
        message: 'Belirtilen izin grubu bulunamadı'
      });
    }

    // Yeni izin oluştur
    const permission = await Permission.create({
      name,
      description,
      code,
      permissionGroup
    });

    res.status(201).json({
      success: true,
      message: 'İzin başarıyla oluşturuldu',
      permission
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin oluşturulamadı',
      error: error.message
    });
  }
};

// @desc    Belirli bir izni getir
// @route   GET /api/permissions/:id
// @access  Private
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id).populate('permissionGroup', 'name code');

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      permission
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin getirilemedi',
      error: error.message
    });
  }
};

// @desc    İzni güncelle
// @route   PUT /api/permissions/:id
// @access  Private
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { name, description, code, permissionGroup, isActive } = req.body;

    // İsim veya kod değiştiriliyorsa, başka bir izin ile çakışıyor mu kontrol et
    if (name || code) {
      const query: any = { _id: { $ne: req.params.id } };
      
      if (name) query.name = name;
      if (code) query.code = code;
      
      const existingPermission = await Permission.findOne(query);
      
      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Bu isim veya kod ile başka bir izin zaten mevcut'
        });
      }
    }

    // İzin grubu değiştiriliyorsa, yeni grup var mı kontrol et
    if (permissionGroup) {
      const groupExists = await PermissionGroup.findById(permissionGroup);
      if (!groupExists) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen izin grubu bulunamadı'
        });
      }
    }

    // İzni güncelle
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { name, description, code, permissionGroup, isActive },
      { new: true, runValidators: true }
    ).populate('permissionGroup', 'name code');

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'İzin başarıyla güncellendi',
      permission
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin güncellenemedi',
      error: error.message
    });
  }
};

// @desc    İzni sil
// @route   DELETE /api/permissions/:id
// @access  Private
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
    }

    await permission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'İzin başarıyla silindi'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin silinemedi',
      error: error.message
    });
  }
}; 