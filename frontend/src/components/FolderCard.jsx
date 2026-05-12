import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';

export default function FolderCard({ folder, index = 0 }) {
  const navigate = useNavigate();
  const isEven = index % 2 === 0;

  return (
    <div
      onClick={() => navigate(`/folder/${folder.id}`)}
      className="bg-[#ffffff] border-[0.5px] border-[#E0E0E0] rounded-[8px] p-[14px] cursor-pointer transition-all duration-200 hover:border-[#297BBF] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] group"
    >
      <div 
        className="rounded-[6px] p-[6px] inline-flex items-center justify-center"
        style={{ 
          backgroundColor: isEven ? '#EBF4FC' : '#FFFBE6',
          color: isEven ? '#297BBF' : '#c9a800'
        }}
      >
        <Folder size={22} />
      </div>
      <p className="font-[500] text-[13px] text-[#000000] mt-[10px] truncate">{folder.nama}</p>
      <p className="text-[11px] text-[#666666] mt-0.5">{folder.pembuat?.nama || 'Unknown'}</p>
      <p className="text-[11px] text-[#297BBF] font-[500] mt-1.5 group-hover:underline">
        Buka
      </p>
    </div>
  );
}
