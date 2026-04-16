'use client';

import { useState } from 'react';
import { UserCheck, Check, X, Building, Phone, Mail } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mockData';
import { User } from '@/lib/types';
import clsx from 'clsx';

export default function ApprovalsPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS.filter(u => u.role === 'OWNER'));

  const pendingUsers = users.filter(u => u.status === 'pending');
  const processedUsers = users.filter(u => u.status !== 'pending');

  const handleApprove = (id: string) => {
    if (confirm('입점을 승인하시겠습니까?')) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    }
  };

  const handleReject = (id: string) => {
    if (confirm('입점을 반려하시겠습니까?')) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
    }
  };

  return (
    <div className="max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-red-600" /> 입점 승인 관리
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">대기 중인 요청 ({pendingUsers.length})</h2>
        
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">대기 중인 입점 요청이 없습니다.</div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-800">{user.businessName}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">심사대기</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/> 사업자번호: {user.businessNumber}</div>
                    <div className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5"/> 대표자명: {user.name}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> 연락처: {user.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> 아이디(이메일): {user.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(user.id)} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                    <Check className="w-4 h-4"/> 승인
                  </button>
                  <button onClick={() => handleReject(user.id)} className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold text-sm transition-colors">
                    <X className="w-4 h-4"/> 반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">최근 처리 내역</h2>
        
        {processedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">처리 내역이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-bold text-center">상태</th>
                  <th className="px-4 py-2 font-bold">업체명</th>
                  <th className="px-4 py-2 font-bold">아이디(이메일)</th>
                  <th className="px-4 py-2 font-bold">연락처</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center">
                      <span className={clsx("px-2 py-1 text-xs rounded-full font-bold", 
                        user.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {user.status === 'approved' ? '승인완료' : '반려됨'}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-bold text-gray-800">{user.businessName}</td>
                    <td className="px-4 py-2 text-gray-500">{user.email}</td>
                    <td className="px-4 py-2 text-gray-500">{user.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
