import { Request, Response } from 'express';
import Role from '../models/Role';
import PermissionGroup from '../models/PermissionGroup';
import Permission from '../models/Permission';
import { Types } from 'mongoose';
import historyService from '../services/historyService';
import { EntityType } from '../models/Entity';
import { ActionType } from '../models/History';
import { PermissionVersionService } from '../services/permissionVersionService';

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
      .populate({
        path: 'permissionGroups.permissionGroup',
        select: 'name code description'
      })
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code'
      })
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
    const { name, description, permissionGroups } = req.body;

    // Rol zaten var mı kontrol et
    const existingRole = await Role.findOne({ name });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Bu isim ile bir rol zaten mevcut'
      });
    }

    // Permission Groups validasyonu
    if (permissionGroups && permissionGroups.length > 0) {
      for (const pg of permissionGroups) {
        // Permission Group var mı kontrol et
        const permissionGroup = await PermissionGroup.findById(pg.permissionGroup);
        if (!permissionGroup) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz izin grubu ID\'si bulundu'
          });
        }

        // Bu grubun permissions'ları ile validate et
        if (pg.permissions && pg.permissions.length > 0) {
          const permissionIds = pg.permissions.map((p: any) => p.permission);
          const validPermissions = await Permission.find({ 
            _id: { $in: permissionIds }
          });
          
          if (validPermissions.length !== permissionIds.length) {
            return res.status(400).json({
              success: false,
              message: 'Geçersiz izin ID\'si bulundu'
            });
          }

          // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
          const groupPermissions = permissionGroup.permissions.map(p => p.toString());
          for (const permId of permissionIds) {
            if (!groupPermissions.includes(permId.toString())) {
              return res.status(400).json({
                success: false,
                message: 'Bazı izinler belirtilen gruba ait değil'
              });
            }
          }
        }
      }
    }

    // Yeni rol oluştur
    const role = await Role.create({
      name,
      description,
      permissionGroups: permissionGroups || []
    });

    const populatedRole = await Role.findById(role._id)
      .populate({
        path: 'permissionGroups.permissionGroup',
        select: 'name code description'
      })
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code'
      });

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
    const role = await Role.findById(req.params.id)
      .populate({
        path: 'permissionGroups.permissionGroup',
        select: 'name code description permissions',
        populate: {
          path: 'permissions',
          select: 'name description code'
        }
      })
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code'
      });

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
    const { name, description, permissions, permissionGroups, isActive, comment } = req.body;
    const userId = (req.user as any)._id;

    // Mevcut rolü al
    const currentRole = await Role.findById(req.params.id)
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code group'
      });

    if (!currentRole) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // İsim değiştiriliyorsa, başka bir rol ile çakışıyor mu kontrol et
    if (name && name !== currentRole.name) {
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

    let finalPermissionGroups;

    // Eğer permissions array'i geliyorsa, bunu permissionGroups formatına çevir
    if (permissions && Array.isArray(permissions)) {
      try {
        // Tüm permission group'ları al (içlerindeki permission'lar ile birlikte)
        const allPermissionGroups = await PermissionGroup.find()
          .populate('permissions', '_id name code')
          .lean();
        
        

        // Her permission group için finalPermissionGroups oluştur
        finalPermissionGroups = allPermissionGroups.map(permGroup => {
          const groupPermissions = permGroup.permissions || [];
          
          const permissionsWithGrant = groupPermissions.map((permission: any) => ({
            permission: permission._id,
            granted: permissions.includes(permission._id.toString())
          }));
          
          const grantedCount = permissionsWithGrant.filter(p => p.granted).length;
          
          
          return {
            permissionGroup: permGroup._id,
            permissions: permissionsWithGrant
          };
        });

      } catch (error: any) {
        console.error('Permission grouping hatası:', error);
        return res.status(500).json({
          success: false,
          message: 'İzin gruplama işlemi sırasında hata oluştu',
          error: error.message
        });
      }
    } else if (permissionGroups) {
      // Direkt permissionGroups geliyorsa validation yap
      for (const pg of permissionGroups) {
        // Permission Group var mı kontrol et
        const permissionGroup = await PermissionGroup.findById(pg.permissionGroup);
        if (!permissionGroup) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz izin grubu ID\'si bulundu'
          });
        }

        // Bu grubun permissions'ları ile validate et
        if (pg.permissions && pg.permissions.length > 0) {
          const permissionIds = pg.permissions.map((p: any) => p.permission);
          const validPermissions = await Permission.find({ 
            _id: { $in: permissionIds }
          });
          
          if (validPermissions.length !== permissionIds.length) {
            return res.status(400).json({
              success: false,
              message: 'Geçersiz izin ID\'si bulundu'
            });
          }

          // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
          const groupPermissions = permissionGroup.permissions.map(p => p.toString());
          for (const permId of permissionIds) {
            if (!groupPermissions.includes(permId.toString())) {
              return res.status(400).json({
                success: false,
                message: 'Bazı izinler belirtilen gruba ait değil'
              });
            }
          }
        }
      }
      finalPermissionGroups = permissionGroups;
    }

    // Önceki durumu kaydet (history için)
    const previousData = {
      name: currentRole.name,
      description: currentRole.description,
      isActive: currentRole.isActive,
      permissions: currentRole.permissionGroups.reduce((acc: string[], pg) => {
        const grantedPermissions = pg.permissions
          .filter(p => p.granted)
          .map(p => (p.permission as any)._id.toString());
        return [...acc, ...grantedPermissions];
      }, [])
    };

    // Rolü güncelle
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (finalPermissionGroups) updateData.permissionGroups = finalPermissionGroups;
    if (isActive !== undefined) updateData.isActive = isActive;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'permissionGroups.permissionGroup',
      select: 'name code description'
    })
    .populate({
      path: 'permissionGroups.permissions.permission',
      select: 'name description code'
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // Yeni durumu hazırla (history için)
    const newData = {
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: permissions || role.permissionGroups.reduce((acc: string[], pg) => {
        const grantedPermissions = pg.permissions
          .filter(p => p.granted)
          .map(p => (p.permission as any)._id.toString());
        return [...acc, ...grantedPermissions];
      }, [])
    };

    // Değişiklik geçmişini kaydet
    if (userId) {
      try {
        await historyService.recordHistory({
          entityType: EntityType.ROLE,
          entityId: req.params.id,
          userId,
          action: ActionType.UPDATE,
          previousData,
          newData,
          comment: comment || 'Rol güncellendi'
        });
      } catch (historyError) {
        console.error('History kaydı oluşturulamadı:', historyError);
        // History hatası ana işlemi durdurmaz
      }
    }

    // Bu role sahip tüm kullanıcıların permission version'ını güncelle
    try {
      await PermissionVersionService.invalidateRolePermissions(req.params.id);
      console.log(`Permission versions invalidated for role: ${req.params.id}`);
    } catch (permissionError) {
      console.error('Permission version güncelleme hatası:', permissionError);
      // Permission version hatası ana işlemi durdurmaz
    }

    res.status(200).json({
      success: true,
      message: 'Rol başarıyla güncellendi',
      role
    });
  } catch (error: any) {
    console.error('Rol güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Rol güncellenemedi',
      error: error.message
    });
  }
};

// @desc    Role permission group ekle
// @route   POST /api/roles/:id/permissionGroups
// @access  Private
export const addPermissionGroupToRole = async (req: Request, res: Response) => {
  try {
    const { permissionGroupId, permissions } = req.body;

    // Rol var mı kontrol et
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // Permission Group var mı kontrol et
    const permissionGroup = await PermissionGroup.findById(permissionGroupId);
    if (!permissionGroup) {
      return res.status(404).json({
        success: false,
        message: 'İzin grubu bulunamadı'
      });
    }

    // Bu permission group zaten role ekli mi?
    const existingPG = role.permissionGroups.find(
      pg => pg.permissionGroup.toString() === permissionGroupId
    );
    if (existingPG) {
      return res.status(400).json({
        success: false,
        message: 'Bu izin grubu zaten role ekli'
      });
    }

    // Permissions validasyonu
    let validatedPermissions = [];
    if (permissions && permissions.length > 0) {
      const permissionIds = permissions.map((p: any) => p.permission);
      const validPermissions = await Permission.find({ 
        _id: { $in: permissionIds }
      });
      
      if (validPermissions.length !== permissionIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz izin ID\'si bulundu'
        });
      }

      // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
      const groupPermissions = permissionGroup.permissions.map(p => p.toString());
      for (const permId of permissionIds) {
        if (!groupPermissions.includes(permId.toString())) {
          return res.status(400).json({
            success: false,
            message: 'Bazı izinler belirtilen gruba ait değil'
          });
        }
      }
      validatedPermissions = permissions;
    }

    // Permission group'u role ekle
    role.permissionGroups.push({
      permissionGroup: permissionGroupId,
      permissions: validatedPermissions
    } as any);

    await role.save();

    // Populate ederek dön
    const updatedRole = await Role.findById(req.params.id)
      .populate({
        path: 'permissionGroups.permissionGroup',
        select: 'name code description'
      })
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code'
      });

    res.status(200).json({
      success: true,
      message: 'İzin grubu başarıyla role eklendi',
      role: updatedRole
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu role eklenemedi',
      error: error.message
    });
  }
};

// @desc    Rolden permission group çıkar
// @route   DELETE /api/roles/:id/permissionGroups/:permissionGroupId
// @access  Private
export const removePermissionGroupFromRole = async (req: Request, res: Response) => {
  try {
    const { id, permissionGroupId } = req.params;

    // Rol var mı kontrol et
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // Permission group rolde var mı kontrol et
    const permissionGroupIndex = role.permissionGroups.findIndex(
      pg => pg.permissionGroup.toString() === permissionGroupId
    );

    if (permissionGroupIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Bu izin grubu rolde mevcut değil'
      });
    }

    // Permission group'u rolden çıkar
    role.permissionGroups.splice(permissionGroupIndex, 1);
    await role.save();

    // Populate ederek dön
    const updatedRole = await Role.findById(id)
      .populate({
        path: 'permissionGroups.permissionGroup',
        select: 'name code description'
      })
      .populate({
        path: 'permissionGroups.permissions.permission',
        select: 'name description code'
      });

    res.status(200).json({
      success: true,
      message: 'İzin grubu başarıyla rolden çıkarıldı',
      role: updatedRole
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzin grubu rolden çıkarılamadı',
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