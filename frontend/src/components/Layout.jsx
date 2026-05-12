import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
