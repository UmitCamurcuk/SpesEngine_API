import { Request, Response } from 'express';
import Permission from '../models/Permission';

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
    const { name, description, code } = req.body;

    // İzin zaten var mı kontrol et
    const existingPermission = await Permission.findOne({ code });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Bu kod ile bir izin zaten mevcut'
      });
    }

    // Yeni izin oluştur
    const permission = await Permission.create({
      name,
      description,
      code
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
    const permission = await Permission.findById(req.params.id);

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
    const { name, description, code, isActive } = req.body;

    // Kod değiştiriliyorsa, başka bir izin ile çakışıyor mu kontrol et
    if (code) {
      const existingPermission = await Permission.findOne({
        _id: { $ne: req.params.id },
        code
      });
      
      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Bu kod ile başka bir izin zaten mevcut'
        });
      }
    }

    // İzni güncelle
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { name, description, code, isActive },
      { new: true, runValidators: true }
    );

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