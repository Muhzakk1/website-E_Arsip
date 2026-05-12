import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, AlertCircle } from 'lucide-react';

export default function ManagePegawaiPage() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [createForm, setCreateForm] = useState({ nama: '', email: '', password: '', role: 'pegawai' });
  const [editForm, setEditForm] = useState({ nama: '', email: '', role: 'pegawai', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
  });

  const { data: pendingUsers, isLoading: isPendingLoading } = useQuery({
    queryKey: ['users-pending'],
    queryFn: () => api.get('/admin/users/pending').then(r => r.data.data),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: (data) => api.post('/admin/users', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      setCreateForm({ nama: '', email: '', password: '', role: 'pegawai' });
      toast.success(res.data.message || 'Pegawai berhasil ditambahkan.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal menambah pegawai.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/users/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
      toast.success(res.data.message || 'Data pegawai berhasil diperbarui.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal mengupdate pegawai.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirm(null);
      toast.success(res.data.message || 'Akun berhasil dihapus.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal menghapus akun.'),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/status`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.data.message || 'Status berhasil diubah.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal mengubah status.'),
  });

  const approveMut = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/approve`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users-pending'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.data.message || 'Pegawai berhasil disetujui.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal menyetujui pendaftaran.'),
  });

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ role: u.role });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createMut.mutate(createForm);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMut.mutate({ id: editUser.id, data: { role: editForm.role } });
  };

  const handleToggle = (u) => {
    if (u.id === currentUser?.id) return;
    if (window.confirm(`${u.status === 'approved' ? 'Nonaktifkan' : 'Aktifkan'} akun ${u.nama}?`)) {
      toggleMut.mutate(u.id);
    }
  };

  const handleApprove = (u) => {
    if (window.confirm(`Setujui pendaftaran akun ${u.nama}?`)) {
      approveMut.mutate(u.id);
    }
  };

  const pendingCount = pendingUsers?.length ?? 0;

  return (
    <Layout>
      <div className="animate-fadeIn p-[24px]">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-[600] text-[18px] text-[#1a1a1a]">Kelola Pegawai</h1>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-1.5 text-[13px]">
            <Plus size={15} />
            Tambah Pegawai
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit bg-[#F4F4F5]">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-[500] transition-all ${
              activeTab === 'users' ? 'bg-[#ffffff] text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'bg-transparent text-[#666666]'
            }`}
          >
            Semua Pegawai
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-[500] transition-all flex items-center gap-2 ${
              activeTab === 'pending' ? 'bg-[#ffffff] text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'bg-transparent text-[#666666]'
            }`}
          >
            Menunggu Persetujuan
            {pendingCount > 0 && (
              <span className="flex items-center justify-center text-[#ffffff] text-[10px] font-bold rounded-full w-[20px] h-[20px] bg-[#297BBF]">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab: Semua Pegawai */}
        {activeTab === 'users' && (
          <div className="bg-[#ffffff] overflow-hidden border-[0.5px] border-[#E0E0E0] rounded-[8px]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F4F5]">
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Nama</th>
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Email</th>
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Role</th>
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Status</th>
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Tanggal Daftar</th>
                    <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#666666] px-[14px] py-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b-[0.5px] border-[#E0E0E0]">
                        {[...Array(6)].map((_, j) => <td key={j} className="px-[14px] py-[10px]"><div className="h-4 rounded animate-pulse-soft bg-[#F4F4F5]" /></td>)}
                      </tr>
                    ))
                  ) : users?.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-[48px] px-[14px] text-[#666666] text-[13px]">Belum ada pegawai terdaftar.</td></tr>
                  ) : (
                    users?.map(u => {
                      const isSelf = u.id === currentUser?.id;
                      const isApproved = u.status === 'approved';
                      return (
                        <tr key={u.id} className="transition-colors duration-150 hover:bg-[#F8F9FB] border-b-[0.5px] border-[#E0E0E0]">
                          <td className="px-[14px] py-[10px]">
                            <div className="flex items-center gap-2.5">
                              <div className="rounded-full flex items-center justify-center text-[#ffffff] text-[12px] font-bold flex-shrink-0 w-[30px] h-[30px] bg-[#297BBF]">
                                {u.nama?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-[500] text-[13px] text-[#1a1a1a]">{u.nama}</span>
                            </div>
                          </td>
                          <td className="px-[14px] py-[10px] text-[13px] text-[#666666]">{u.email}</td>
                          <td className="px-[14px] py-[10px]">
                            <span className={`inline-flex items-center font-[500] text-[11px] px-[8px] py-[2px] rounded-[20px] ${
                              u.role === 'admin' ? 'bg-[#DBEAFE] text-[#1e40af]' : 'bg-[#F3F4F6] text-[#374151]'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'Pegawai'}
                            </span>
                          </td>
                          <td className="px-[14px] py-[10px]">
                            <span className={`inline-flex items-center font-[500] text-[11px] px-[8px] py-[2px] rounded-[20px] ${
                              isApproved ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                            }`}>
                              {isApproved ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-[14px] py-[10px] text-[13px] text-[#666666]">
                            {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-[14px] py-[10px]">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEdit(u)}
                                title="Edit data pegawai"
                                className="text-[12px] font-[500] py-[6px] px-[10px] rounded-[6px] transition-all bg-[#EBF4FC] text-[#297BBF] hover:bg-[#d0e5f5]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggle(u)}
                                disabled={isSelf || toggleMut.isPending}
                                title={isSelf ? 'Tidak dapat mengubah status akun sendiri' : `${isApproved ? 'Nonaktifkan' : 'Aktifkan'} akun`}
                                className={`text-[12px] font-[500] py-[6px] px-[10px] rounded-[6px] transition-all border ${
                                  isApproved ? 'border-[#ef4444] text-[#ef4444] hover:bg-[#FEE2E2]' : 'border-[#297BBF] text-[#297BBF] hover:bg-[#EBF4FC]'
                                } ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                              >
                                {isApproved ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => setDeleteConfirm(u)}
                                  title="Hapus akun pegawai"
                                  className="text-[12px] font-[500] py-[6px] px-[10px] rounded-[6px] transition-all bg-[#FEE2E2] text-[#991b1b] hover:bg-[#fecaca]"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Menunggu Persetujuan */}
        {activeTab === 'pending' && (
          <div className="bg-[#ffffff] overflow-hidden border-[0.5px] border-[#E0E0E0] rounded-[8px]">
            {pendingCount === 0 && !isPendingLoading ? (
              <div className="py-[64px] text-center">
                <div className="inline-flex items-center justify-center rounded-full mb-4 w-[56px] h-[56px] bg-[#DCFCE7]">
                  <svg className="w-7 h-7 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-[500] text-[13px] text-[#666666]">Tidak ada pendaftaran yang menunggu persetujuan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FEF9C3]">
                      <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#854d0e] px-[14px] py-[10px]">Nama</th>
                      <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#854d0e] px-[14px] py-[10px]">Email</th>
                      <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#854d0e] px-[14px] py-[10px]">Tanggal Daftar</th>
                      <th className="text-left font-[500] uppercase tracking-[0.05em] text-[11px] text-[#854d0e] px-[14px] py-[10px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isPendingLoading ? (
                      [...Array(2)].map((_, i) => (
                        <tr key={i} className="border-b-[0.5px] border-[#E0E0E0]">
                          {[...Array(4)].map((_, j) => <td key={j} className="px-[14px] py-[10px]"><div className="h-4 rounded animate-pulse-soft bg-[#F4F4F5]" /></td>)}
                        </tr>
                      ))
                    ) : (
                      pendingUsers?.map(u => (
                        <tr key={u.id} className="transition-colors duration-150 hover:bg-[#F8F9FB] border-b-[0.5px] border-[#E0E0E0]">
                          <td className="px-[14px] py-[10px]">
                            <div className="flex items-center gap-2.5">
                              <div className="rounded-full flex items-center justify-center text-[#854d0e] text-[12px] font-bold flex-shrink-0 w-[30px] h-[30px] bg-[#FBD206]">
                                {u.nama?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-[500] text-[13px] text-[#1a1a1a]">{u.nama}</span>
                            </div>
                          </td>
                          <td className="px-[14px] py-[10px] text-[13px] text-[#666666]">{u.email}</td>
                          <td className="px-[14px] py-[10px] text-[13px] text-[#666666]">
                            {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-[14px] py-[10px]">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleApprove(u)}
                                disabled={approveMut.isPending}
                                className="text-[12px] font-[500] py-[6px] px-[12px] rounded-[6px] transition-all flex items-center gap-1.5 bg-[#DCFCE7] text-[#166534] hover:bg-[#bbf7d0]"
                              >
                                ✓ Setujui
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(u)}
                                className="text-[12px] font-[500] py-[6px] px-[10px] rounded-[6px] transition-all bg-[#FEE2E2] text-[#991b1b] hover:bg-[#fecaca]"
                                title="Tolak & hapus pendaftaran"
                              >
                                ✕ Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Tambah Pegawai */}
        <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setCreateForm({ nama: '', email: '', password: '', role: 'pegawai' }); }} title="Tambah Pegawai Baru">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-[500] mb-1 text-[12px] text-[#333333]">Nama Lengkap</label>
              <input type="text" value={createForm.nama} onChange={(e) => setCreateForm(f => ({ ...f, nama: e.target.value }))} className="input-field" placeholder="Nama lengkap" required />
            </div>
            <div>
              <label className="block font-[500] mb-1 text-[12px] text-[#333333]">Email</label>
              <input type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@dinas.go.id" required />
            </div>
            <div>
              <label className="block font-[500] mb-1 text-[12px] text-[#333333]">Password</label>
              <input type="password" value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} className="input-field" placeholder="Minimal 6 karakter" required minLength={6} />
            </div>
            <div>
              <label className="block font-[500] mb-1 text-[12px] text-[#333333]">Role</label>
              <select value={createForm.role} onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))} className="input-field">
                <option value="pegawai">Pegawai</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {createMut.isError && <p className="text-[14px] text-[#ef4444]">{createMut.error?.response?.data?.message || 'Gagal menambah pegawai.'}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Batal</button>
              <button type="submit" disabled={createMut.isPending} className="btn-primary text-[13px] flex items-center gap-2">
                {createMut.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Tambah Pegawai
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Edit Pegawai */}
        <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Ubah Role — ${editUser?.nama}`}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 rounded-[8px] bg-[#F4F4F5] text-[13px] text-[#666666]">
              <p><span className="font-[500] text-[#333333]">Nama:</span> {editUser?.nama}</p>
              <p className="mt-1"><span className="font-[500] text-[#333333]">Email:</span> {editUser?.email}</p>
            </div>
            <div>
              <label className="block font-[500] mb-1 text-[12px] text-[#333333]">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                className="input-field"
                disabled={editUser?.id === currentUser?.id}
              >
                <option value="pegawai">Pegawai</option>
                <option value="admin">Admin</option>
              </select>
              {editUser?.id === currentUser?.id && (
                <p className="mt-1 text-[11px] text-[#666666]">Anda tidak dapat mengubah role akun sendiri.</p>
              )}
            </div>
            {updateMut.isError && <p className="text-[14px] text-[#ef4444]">{updateMut.error?.response?.data?.message || 'Gagal mengupdate pegawai.'}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="btn-secondary text-[13px]">Batal</button>
              <button type="submit" disabled={updateMut.isPending} className="btn-primary text-[13px] flex items-center gap-2">
                {updateMut.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Konfirmasi Hapus */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Akun Pegawai">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-[8px] bg-[#FEE2E2] border border-[#FECACA]">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-[#ef4444]" />
              <div>
                <p className="text-[14px] font-[600] text-[#991b1b]">Hapus akun <span className="italic">{deleteConfirm?.nama}</span>?</p>
                <p className="text-[14px] mt-1 text-[#991b1b]">Tindakan ini tidak dapat dibatalkan. Semua data aktivitas user akan ikut dihapus.</p>
              </div>
            </div>
            {deleteMut.isError && <p className="text-[14px] text-[#ef4444]">{deleteMut.error?.response?.data?.message || 'Gagal menghapus akun.'}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setDeleteConfirm(null); deleteMut.reset(); }} className="btn-secondary text-[13px]">Batal</button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm?.id)}
                disabled={deleteMut.isPending}
                className="text-[14px] font-[500] py-2 px-4 text-[#ffffff] rounded-[6px] transition-all flex items-center gap-2 disabled:opacity-60 bg-[#ef4444] hover:bg-[#dc2626]"
              >
                {deleteMut.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
