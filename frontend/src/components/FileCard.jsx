import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { File, Download, Trash2 } from 'lucide-react';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatMimeType(mime) {
  if (!mime) return 'FILE';
  if (mime.includes('wordprocessingml.document') || mime.includes('msword')) return 'DOCX';
  if (mime.includes('spreadsheetml.sheet') || mime.includes('ms-excel')) return 'XLSX';
  if (mime.includes('presentationml.presentation') || mime.includes('ms-powerpoint')) return 'PPTX';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('image/')) return mime.split('/')[1].toUpperCase();
  if (mime.includes('text/plain')) return 'TXT';
  if (mime.includes('zip') || mime.includes('rar')) return 'ZIP';
  return mime.split('/').pop().toUpperCase() || 'FILE';
}

export default function FileCard({ file, onDelete }) {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || file.diunggah_oleh === user?.id;

  const handleDownload = async () => {
    try {
      const res = await api.get(`/files/${file.id}/download`);
      window.open(res.data.data.url, '_blank');
    } catch (err) {
      alert('Gagal mengunduh file.');
    }
  };

  return (
    <div className="flex items-center gap-3 bg-[#ffffff] transition-colors duration-150 hover:bg-[#F8F9FB] border-[0.5px] border-[#E0E0E0] rounded-[8px] px-[14px] py-[12px]">
      {/* Icon */}
      <div className="flex items-center justify-center flex-shrink-0 bg-[#EBF4FC] rounded-[6px] p-[6px]">
        <File size={20} color="#297BBF" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-[500] text-[#000000] truncate text-[13px]">{file.nama_asli}</h4>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#666666]">
          <span className="font-[600] px-1.5 py-0.5 bg-[#F4F4F5] rounded-[4px]">{formatMimeType(file.tipe_mime)}</span>
          <span>•</span>
          <span>{formatSize(file.ukuran_bytes)}</span>
          <span>•</span>
          <span>{new Date(file.diunggah_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {file.pengunggah && (<><span>•</span><span>{file.pengunggah.nama}</span></>)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleDownload}
          title="Download"
          className="flex items-center gap-1 rounded-[6px] text-[12px] font-[500] transition-all duration-150 border border-[#297BBF] text-[#297BBF] px-[10px] py-[4px] hover:bg-[#EBF4FC]"
        >
          <Download size={13} />
          <span>Download</span>
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete && onDelete(file)}
            title="Hapus"
            className="flex items-center gap-1 rounded-[6px] text-[12px] font-[500] transition-all duration-150 border border-[#ef4444] text-[#ef4444] px-[10px] py-[4px] hover:bg-[#FEE2E2]"
          >
            <Trash2 size={13} />
            <span>Hapus</span>
          </button>
        )}
      </div>
    </div>
  );
}
