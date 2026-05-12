const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Register user baru (status = 'pending', menunggu persetujuan admin)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    // Cek apakah email sudah terdaftar
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        nama: nama.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        role: 'pegawai',
        status: false,  // BOOLEAN false = menunggu persetujuan admin
      })
      .select('id, nama, email, role, status')
      .single();

    if (error) {
      console.error('Register insert error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat akun.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Akun Anda sedang menunggu persetujuan dari admin.',
      data: { id: newUser.id, nama: newUser.nama, email: newUser.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    // Cari user berdasarkan email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Normalisasi status — handle boolean (schema lama) dan string (schema baru)
    const status = user.status === true  ? 'approved'
                 : user.status === false ? 'pending'
                 : String(user.status);

    if (status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda sedang menunggu persetujuan admin. Silakan hubungi administrator.',
        code: 'PENDING',
      });
    }

    if (status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
        code: 'INACTIVE',
      });
    }

    if (status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Akun tidak dapat digunakan.' });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }


    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Catat activity log
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      aksi: 'login',
      keterangan: `${user.nama} berhasil login`,
      ip_address: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      },
      message: 'Login berhasil.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      aksi: 'logout',
      keterangan: `${req.user.nama} logout`,
      ip_address: req.ip,
    });
    return res.status(200).json({ success: true, message: 'Logout berhasil.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = { register, login, getMe, logout };
