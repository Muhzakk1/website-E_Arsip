const supabase = require('../config/supabase');

/**
 * Get dashboard stats
 * GET /api/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Total folder
    const { count: totalFolders, error: errFolders } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true });

    if (errFolders) throw errFolders;

    // Total file aktif
    const { count: totalFiles, error: errFiles } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .is('dihapus_pada', null);

    if (errFiles) throw errFiles;

    // File bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: filesThisMonth, error: errMonth } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .is('dihapus_pada', null)
      .gte('diunggah_pada', startOfMonth.toISOString());

    if (errMonth) throw errMonth;

    return res.status(200).json({
      success: true,
      data: {
        totalFolders: totalFolders || 0,
        totalFiles: totalFiles || 0,
        filesThisMonth: filesThisMonth || 0,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik dashboard.',
    });
  }
};

module.exports = { getDashboardStats };
