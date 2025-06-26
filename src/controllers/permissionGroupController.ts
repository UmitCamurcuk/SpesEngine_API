import { Request, Response } from 'express';
import PermissionGroup from '../models/PermissionGroup';
import Permission from '../models/Permission';

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
      .populate('permissions', 'name description code')
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
    const { name, description, code, permissions } = req.body;

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

    // Eğer permissions verildiyse, bunların geçerli olup olmadığını kontrol et
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz izin ID\'leri bulundu'
        });
      }
    }

    // Yeni izin grubu oluştur
    const permissionGroup = await PermissionGroup.create({
      name,
      description,
      code,
      permissions: permissions || []
    });

    // Populate ederek dön
    const populatedPermissionGroup = await PermissionGroup.findById(permissionGroup._id)
      .populate('permissions', 'name description code');

    res.status(201).json({
      success: true,
      message: 'İzin grubu başarıyla oluşturuldu',
      permissionGroup: populatedPermissionGroup
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
    const permissionGroup = await PermissionGroup.findById(req.params.id)
      .populate('permissions', 'name description code');

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
    const { name, description, code, permissions, isActive } = req.body;

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

    // Eğer permissions verildiyse, bunların geçerli olup olmadığını kontrol et
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz izin ID\'leri bulundu'
        });
      }
    }

    // İzin grubunu güncelle
    const permissionGroup = await PermissionGroup.findByIdAndUpdate(
      req.params.id,
      { name, description, code, permissions, isActive },
      { new: true, runValidators: true }
    ).populate('permissions', 'name description code');

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

// @desc    İzin grubuna izin ekle
// @route   POST /api/permissionGroups/:id/permissions
// @access  Private
export const addPermissionToGroup = async (req: Request, res: Response) => {
  try {
    const { permissionId } = req.body;

    // İzin grubu var mı kontrol et
    const permissionGroup = await PermissionGroup.findById(req.params.id);
    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    // İzin var mı kontrol et
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
    }

    // İzin zaten grupta var mı kontrol et
    if (permissionGroup.permissions.includes(permissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Bu izin zaten grupta mevcut'
      });
    }

    // İzni gruba ekle
    permissionGroup.permissions.push(permissionId);
    await permissionGroup.save();

    // Populate ederek dön
    const updatedPermissionGroup = await PermissionGroup.findById(req.params.id)
      .populate('permissions', 'name description code');

    res.status(200).json({
      success: true,
      message: 'İzin başarıyla gruba eklendi',
      permissionGroup: updatedPermissionGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin gruba eklenemedi',
      error: error.message
    });
  }
};

// @desc    İzin grubundan izin çıkar
// @route   DELETE /api/permissionGroups/:id/permissions/:permissionId
// @access  Private
export const removePermissionFromGroup = async (req: Request, res: Response) => {
  try {
    const { id, permissionId } = req.params;

    // İzin grubu var mı kontrol et
    const permissionGroup = await PermissionGroup.findById(id);
    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    // İzin grupta var mı kontrol et
    if (!permissionGroup.permissions.includes(permissionId as any)) {
      return res.status(400).json({
        success: false,
        message: 'Bu izin grupta mevcut değil'
      });
    }

    // İzni gruptan çıkar
    permissionGroup.permissions = permissionGroup.permissions.filter(
      p => p.toString() !== permissionId
    );
    await permissionGroup.save();

    // Populate ederek dön
    const updatedPermissionGroup = await PermissionGroup.findById(id)
      .populate('permissions', 'name description code');

    res.status(200).json({
      success: true,
      message: 'İzin başarıyla gruptan çıkarıldı',
      permissionGroup: updatedPermissionGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin gruptan çıkarılamadı',
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