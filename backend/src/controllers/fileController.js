const { v4: uuidv4 } = require('uuid');
const path = require('path');
const supabase = require('../config/supabase');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File wajib diunggah.' });
    const { folder_id } = req.body;
    if (!folder_id) return res.status(400).json({ success: false, message: 'folder_id wajib diisi.' });

    const { data: folder, error: fe } = await supabase.from('folders').select('id, nama').eq('id', folder_id).single();
    if (fe || !folder) return res.status(404).json({ success: false, message: 'Folder tidak ditemukan.' });

    const ext = path.extname(req.file.originalname);
    const uid = uuidv4();
    const storagePath = `${folder_id}/${uid}${ext}`;

    const { error: ue } = await supabase.storage.from('arsip-dokumen').upload(storagePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (ue) return res.status(500).json({ success: false, message: 'Gagal mengunggah file ke storage.' });

    const { data: newFile, error: de } = await supabase.from('files').insert({
      nama_file: `${uid}${ext}`, nama_asli: req.file.originalname, tipe_mime: req.file.mimetype,
      ukuran_bytes: req.file.size, path_penyimpanan: storagePath, folder_id, diunggah_oleh: req.user.id,
    }).select('*, pengunggah:users!diunggah_oleh(id,nama,email)').single();
    if (de) return res.status(500).json({ success: false, message: 'Gagal menyimpan metadata.' });

    await supabase.from('activity_logs').insert({ user_id: req.user.id, aksi: 'upload_file', file_id: newFile.id, keterangan: `Upload file ${req.file.originalname} ke folder ${folder.nama}`, ip_address: req.ip });
    return res.status(201).json({ success: true, data: newFile, message: 'File berhasil diunggah.' });
  } catch (error) { console.error('uploadFile error:', error); return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' }); }
};

const downloadFile = async (req, res) => {
  try {
    const { data: file, error } = await supabase.from('files').select('*').eq('id', req.params.id).single();
    if (error || !file) return res.status(404).json({ success: false, message: 'File tidak ditemukan.' });
    if (file.dihapus_pada) return res.status(410).json({ success: false, message: 'File sudah dihapus.' });

    const { data: sd, error: se } = await supabase.storage.from('arsip-dokumen').createSignedUrl(file.path_penyimpanan, 60);
    if (se) return res.status(500).json({ success: false, message: 'Gagal membuat URL download.' });

    await supabase.from('activity_logs').insert({ user_id: req.user.id, aksi: 'download_file', file_id: file.id, keterangan: `Download file ${file.nama_asli}`, ip_address: req.ip });
    return res.status(200).json({ success: true, data: { url: sd.signedUrl, nama_asli: file.nama_asli, tipe_mime: file.tipe_mime } });
  } catch (error) { console.error('downloadFile error:', error); return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' }); }
};

const deleteFile = async (req, res) => {
  try {
    const { data: file, error } = await supabase.from('files').select('*').eq('id', req.params.id).single();
    if (error || !file) return res.status(404).json({ success: false, message: 'File tidak ditemukan.' });
    if (file.dihapus_pada) return res.status(410).json({ success: false, message: 'File sudah dihapus.' });
    if (req.user.role !== 'admin' && file.diunggah_oleh !== req.user.id) return res.status(403).json({ success: false, message: 'Tidak memiliki izin.' });

    const { error: ue } = await supabase.from('files').update({ dihapus_pada: new Date().toISOString() }).eq('id', req.params.id);
    if (ue) return res.status(500).json({ success: false, message: 'Gagal menghapus file.' });

    await supabase.from('activity_logs').insert({ user_id: req.user.id, aksi: 'hapus_file', file_id: file.id, keterangan: `Menghapus file ${file.nama_asli}`, ip_address: req.ip });
    return res.status(200).json({ success: true, message: 'File berhasil dihapus.' });
  } catch (error) { console.error('deleteFile error:', error); return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' }); }
};

const searchFiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(200).json({ success: true, data: [] });

    const { data: files, error } = await supabase.from('files')
      .select('*, pengunggah:users!diunggah_oleh(id,nama,email), folder:folders!folder_id(id,nama)')
      .is('dihapus_pada', null).ilike('nama_asli', `%${q.trim()}%`).order('diunggah_pada', { ascending: false });
    if (error) return res.status(500).json({ success: false, message: 'Gagal mencari file.' });

    await supabase.from('activity_logs').insert({ user_id: req.user.id, aksi: 'cari_file', keterangan: `Mencari: ${q.trim()}`, ip_address: req.ip });
    return res.status(200).json({ success: true, data: files });
  } catch (error) { console.error('searchFiles error:', error); return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' }); }
};

module.exports = { uploadFile, downloadFile, deleteFile, searchFiles };
