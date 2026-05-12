const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa.',
      });
    }

    // Query user dari database untuk pastikan masih ada dan aktif
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role, status, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    // Normalisasi status — handle boolean (schema lama) dan string (schema baru)
    const status = user.status === true  ? 'approved'
                 : user.status === false ? 'pending'
                 : String(user.status);

    if (status !== 'approved') {
      const msg = status === 'pending'
        ? 'Akun Anda sedang menunggu persetujuan admin.'
        : 'Akun Anda telah dinonaktifkan. Hubungi administrator.';
      return res.status(403).json({ success: false, message: msg });
    }


    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

module.exports = auth;
