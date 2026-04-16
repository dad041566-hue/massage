'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Edit2, Crown, Store, Check, X } from 'lucide-react';
import { MOCK_SHOPS, MOCK_USERS } from '@/lib/mockData';
import { Shop, REGIONS, THEMES, UserRole } from '@/lib/types';
import clsx from 'clsx';

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  // 테스트를 위해 로컬 스토리지 또는 강제로 ADMIN/OWNER 판단 (여기선 MOCK_USERS[0] = ADMIN, [1] = OWNER 로 가정)
  // 실제 환경에서는 React Context나 전역 상태 관리에서 currentUser를 받아옵니다.
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);

  // layout에서 제공하는 테스트 버튼 연동용 (임시 야매 로직 - setInterval로 역할 확인)
  useEffect(() => {
    // 실제로는 Auth Provider를 구성해야 하지만, 임시로 layout의 변경을 감지합니다.
    const checkRole = () => {
      const isOwner = document.body.innerText.includes('내 업소 관리 모드');
      setCurrentUser(isOwner ? MOCK_USERS[1] : MOCK_USERS[0]);
    };
    checkRole();
    const interval = setInterval(checkRole, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = shops.filter(shop => {
    const isMyShop = currentUser.role === 'OWNER' ? shop.ownerId === currentUser.id : true;
    const mRegion = regionFilter === 'all' || shop.region === regionFilter;
    const mSearch = !search || shop.name.includes(search) || shop.address.includes(search);
    return isMyShop && mRegion && mSearch;
  });

  const toggleVisibility = (id: string) => {
    if (currentUser.role !== 'ADMIN') return alert('최고 관리자만 접근 가능합니다.');
    setShops(prev => prev.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  const togglePremium = (id: string) => {
    if (currentUser.role !== 'ADMIN') return alert('최고 관리자만 접근 가능합니다.');
    setShops(prev => prev.map(s => s.id === id ? { ...s, isPremium: !s.isPremium } : s));
  };

  return (
    <div className="max-w-[1200px] space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <Store className="w-5 h-5 text-red-600" /> {currentUser.role === 'ADMIN' ? '업소 목록 관리' : '내 업소 관리'}
        </h1>
        {currentUser.role === 'ADMIN' && (
          <Link href="/admin/shops/new"
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" /> 업소 등록
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 border border-gray-200 rounded">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="업소명, 주소 검색" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:border-red-500 outline-none" />
        </div>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-red-500 outline-none">
          {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2 font-bold w-12 text-center">노출</th>
              <th className="px-4 py-2 font-bold w-12 text-center">AD</th>
              <th className="px-4 py-2 font-bold">업소명</th>
              <th className="px-4 py-2 font-bold">지역/테마</th>
              <th className="px-4 py-2 font-bold">연락처</th>
              <th className="px-4 py-2 font-bold w-20 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(shop => (
              <tr key={shop.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center">
                  <button 
                    onClick={() => toggleVisibility(shop.id)}
                    disabled={currentUser.role !== 'ADMIN'}
                    className={clsx('w-8 h-5 rounded-full relative transition-colors', 
                      shop.isVisible ? 'bg-green-500' : 'bg-gray-300',
                      currentUser.role !== 'ADMIN' && 'opacity-50 cursor-not-allowed'
                    )}>
                    <div className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', shop.isVisible ? 'right-0.5' : 'left-0.5')} />
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button 
                    onClick={() => togglePremium(shop.id)}
                    disabled={currentUser.role !== 'ADMIN'}
                    className={clsx('p-1 rounded text-white transition-colors', 
                      shop.isPremium ? 'bg-amber-500' : 'bg-gray-300',
                      currentUser.role === 'ADMIN' && !shop.isPremium && 'hover:bg-gray-400',
                      currentUser.role !== 'ADMIN' && 'opacity-50 cursor-not-allowed'
                    )}>
                    <Crown className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="px-4 py-2 font-bold text-gray-800">
                  <Link href={`/admin/shops/${shop.id}`} className="hover:text-red-600 hover:underline">{shop.name}</Link>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {shop.regionLabel} {shop.subRegionLabel ? `> ${shop.subRegionLabel}` : ''} / {shop.themeLabel}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">{shop.phone}</td>
                <td className="px-4 py-2 text-center">
                  <Link href={`/admin/shops/${shop.id}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs text-gray-600">
                    <Edit2 className="w-3 h-3" /> 수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-6 text-gray-400 text-sm">목록이 없습니다.</div>}
      </div>
    </div>
  );
}
