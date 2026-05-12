import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Search, FileX, Download, File } from 'lucide-react';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [debouncedKw, setDebouncedKw] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKw(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedKw],
    queryFn: () => api.get(`/files/search?q=${encodeURIComponent(debouncedKw)}`).then(r => r.data.data),
    enabled: debouncedKw.length > 0,
  });

  const handleDownload = async (file) => {
    try {
      const res = await api.get(`/files/${file.id}/download`);
      window.open(res.data.data.url, '_blank');
    } catch { alert('Gagal mengunduh file.'); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Layout>
      <div className="animate-fadeIn p-[24px]">
        <div className="mb-5">
          <h1 className="font-[600] text-[18px] text-[#1a1a1a]">Cari Dokumen</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 bg-[#ffffff] transition-all duration-200 border border-[#E0E0E0] rounded-[8px] px-[14px] py-[10px] focus-within:border-[#297BBF] focus-within:shadow-[0_0_0_3px_rgba(41,123,191,0.15)]">
            <Search size={18} color="#297BBF" className="flex-shrink-0" />
            <input
              id="search-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ketik nama dokumen..."
              className="flex-1 outline-none border-none bg-transparent text-[14px]"
            />
            {isFetching && (
              <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0 border-[#E0E0E0] border-t-[#297BBF]" />
            )}
          </div>
        </div>

        {/* Results */}
        {!debouncedKw ? (
          <div className="text-center py-[60px] px-[24px]">
            <Search size={48} color="#E0E0E0" className="mx-auto mb-4" />
            <p className="text-[14px] text-[#666666]">Masukkan kata kunci untuk mencari dokumen</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse-soft bg-[#F4F4F5] rounded-[8px] h-[64px]" />
            ))}
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-[60px] px-[24px]">
            <FileX size={48} color="#E0E0E0" className="mx-auto mb-4" />
            <p className="font-[500] text-[14px] text-[#1a1a1a]">Tidak ada dokumen ditemukan</p>
            <p className="text-[12px] text-[#666666] mt-1">Coba kata kunci yang berbeda</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-2 text-[12px] text-[#666666]">{data.length} dokumen ditemukan</p>
            {data.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-[#ffffff] transition-colors duration-150 hover:bg-[#F8F9FB] animate-fadeIn border-[0.5px] border-[#E0E0E0] rounded-[8px] px-[14px] py-[12px]"
              >
                <div className="flex items-center justify-center flex-shrink-0 bg-[#EBF4FC] rounded-[6px] p-[6px]">
                  <File size={20} color="#297BBF" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-[500] text-[#000000] truncate text-[13px]">{file.nama_asli}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#666666]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5]">{file.folder?.nama || '—'}</span>
                    <span>•</span>
                    <span>{formatSize(file.ukuran_bytes)}</span>
                    <span>•</span>
                    <span>{new Date(file.diunggah_pada).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-1 rounded-[6px] text-[12px] font-[500] transition-all duration-150 flex-shrink-0 border border-[#297BBF] text-[#297BBF] px-[10px] py-[4px] hover:bg-[#EBF4FC]"
                >
                  <Download size={13} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
