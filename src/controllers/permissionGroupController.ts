import { Request, Response } from 'express';
import PermissionGroup from '../models/PermissionGroup';

// @desc    Tüm izin gruplarını getir
// @route   GET /api/permissionGroups
// @access  Private
export const getPermissionGroups = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await PermissionGroup.countDocuments();
    const permissionGroups = await PermissionGroup.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: permissionGroups.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      },
      permissionGroups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grupları getirilemedi',
      error: error.message
    });
  }
};

// @desc    Yeni bir izin grubu oluştur
// @route   POST /api/permissionGroups
// @access  Private
export const createPermissionGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, code } = req.body;

    // İzin grubu zaten var mı kontrol et
    const existingPermissionGroup = await PermissionGroup.findOne({
      $or: [{ name }, { code }]
    });

    if (existingPermissionGroup) {
      return res.status(400).json({
        success: false,
        message: 'Bu isim veya kod ile bir izin grubu zaten mevcut'
      });
    }

    // Yeni izin grubu oluştur
    const permissionGroup = await PermissionGroup.create({
      name,
      description,
      code
    });

    res.status(201).json({
      success: true,
      message: 'İzin grubu başarıyla oluşturuldu',
      permissionGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu oluşturulamadı',
      error: error.message
    });
  }
};

// @desc    Belirli bir izin grubunu getir
// @route   GET /api/permissionGroups/:id
// @access  Private
export const getPermissionGroupById = async (req: Request, res: Response) => {
  try {
    const permissionGroup = await PermissionGroup.findById(req.params.id);

    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      permissionGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu getirilemedi',
      error: error.message
    });
  }
};

// @desc    İzin grubunu güncelle
// @route   PUT /api/permissionGroups/:id
// @access  Private
export const updatePermissionGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, code, isActive } = req.body;

    // İsim veya kod değiştiriliyorsa, başka bir grup ile çakışıyor mu kontrol et
    if (name || code) {
      const query: any = { _id: { $ne: req.params.id } };
      
      if (name) query.name = name;
      if (code) query.code = code;
      
      const existingPermissionGroup = await PermissionGroup.findOne(query);
      
      if (existingPermissionGroup) {
        return res.status(400).json({
          success: false,
          message: 'Bu isim veya kod ile başka bir izin grubu zaten mevcut'
        });
      }
    }

    // İzin grubunu güncelle
    const permissionGroup = await PermissionGroup.findByIdAndUpdate(
      req.params.id,
      { name, description, code, isActive },
      { new: true, runValidators: true }
    );

    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'İzin grubu başarıyla güncellendi',
      permissionGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu güncellenemedi',
      error: error.message
    });
  }
};

// @desc    İzin grubunu sil
// @route   DELETE /api/permissionGroups/:id
// @access  Private
export const deletePermissionGroup = async (req: Request, res: Response) => {
  try {
    const permissionGroup = await PermissionGroup.findById(req.params.id);

    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    await permissionGroup.deleteOne();

    res.status(200).json({
      success: true,
      message: 'İzin grubu başarıyla silindi'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu silinemedi',
      error: error.message
    });
  }
}; 