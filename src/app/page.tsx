'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, Shuffle, RefreshCw, Star, MapPin, Phone, Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import { MOCK_SHOPS } from '@/lib/mockData';
import { shuffleRegularShops, filterShops, formatRating, sortShopsByPopularity } from '@/lib/utils';
import { Shop, REGIONS, THEMES, DISTRICTS, REGION_MAP } from '@/lib/types';
import ShopCard from '@/components/ShopCard';
import Sidebar from '@/components/Sidebar';

function HomeContent() {
  const searchParams = useSearchParams();
  const selectedRegion = searchParams.get('region') ?? 'all';
  const selectedSubRegion = searchParams.get('subRegion') ?? 'all';
   const selectedTheme = searchParams.get('theme') ?? 'all';
  const searchQuery = searchParams.get('q') ?? '';
  const sortType = searchParams.get('sort') ?? 'random';

  const [shuffledShops, setShuffledShops] = useState<Shop[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [viewMode, setViewMode] = useState<'card'|'list'>('card');

  const doShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const filtered = filterShops(MOCK_SHOPS, selectedRegion, selectedSubRegion, selectedTheme, searchQuery);
      if (sortType === 'popular') {
        // 인기순일 때는 프리미엄 상단 + 일반 인기순 정렬 (셔플 안함)
        const premium = filtered
          .filter(s => s.isPremium)
          .sort((a, b) => (a.premiumOrder ?? 0) - (b.premiumOrder ?? 0));
        const regularSorted = sortShopsByPopularity(filtered.filter(s => !s.isPremium));
        setShuffledShops([...premium, ...regularSorted]);
      } else {
        setShuffledShops(shuffleRegularShops(filtered));
      }
      setIsShuffling(false);
    }, 200);
  };

  useEffect(() => { doShuffle(); }, [selectedRegion, selectedSubRegion, selectedTheme, searchQuery, sortType]);

  // 프리미엄: 지역별 최대 4개 제한
  const allPremium = shuffledShops.filter(s => s.isPremium);
  const premiumShops = selectedRegion === 'all'
    ? allPremium.slice(0, 4)
    : allPremium.filter(s => {
        const mapped = REGION_MAP[selectedRegion];
        return mapped ? s.region === mapped : s.region === selectedRegion;
      }).slice(0, 4);

  const regularShops = shuffledShops.filter(s => !s.isPremium);

  const regionLabel = REGIONS.find(r => r.code === selectedRegion)?.label ?? '전체';
  const subRegionLabel = selectedRegion !== 'all' && selectedSubRegion !== 'all'
    ? (DISTRICTS[selectedRegion]?.find(d => d.code === selectedSubRegion)?.label ?? '')
    : '';
  const themeLabel = THEMES.find(t => t.code === selectedTheme)?.label;

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-3">
      <div className="flex gap-3">
        {/* ===== 좌측 사이드바 (LNB) ===== */}
        <Sidebar />

        {/* ===== 메인 콘텐츠 ===== */}
        <div className="flex-1 min-w-0">

          {/* 메인 배너 (1개) */}
          <div className="bg-gradient-to-r from-red-600 to-rose-500 rounded-lg mb-4 p-4 flex items-center justify-between text-white">
            <div>
              <p className="font-black text-base">
                🔥 {regionLabel} {subRegionLabel} 추천 업소
                {themeLabel && ` · ${themeLabel}`}
              </p>
              <p className="text-sm text-white/80 mt-0.5">
                전국 {MOCK_SHOPS.length}개+ 제휴업소 | 매일 업데이트
              </p>
            </div>
            <button
              onClick={doShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          {/* 모바일 필터 칩 */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide mb-3">
            <Link href="/" className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${!searchParams.get('region') && !searchParams.get('theme') ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 bg-white'}`}>전체</Link>
            {REGIONS.filter(r => r.code !== 'all').map(r => (
              <Link key={r.code} href={`/?region=${r.code}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${selectedRegion === r.code ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 bg-white'}`}>{r.label}</Link>
            ))}
          </div>

          {/* ===== 프리미엄 배너 영역 (지역별 최대 4개) ===== */}
          {premiumShops.length > 0 && (
            <div className="premium-box mb-4 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-black text-amber-700">PREMIUM 추천업소</span>
                <div className="flex-1 h-px bg-amber-200" />
                <span className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">광고 · 최대 4개</span>
              </div>

              {/* 프리미엄 배너 (PC 2열, 모바일 1열 등 확대 적용) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premiumShops.map(shop => (
                  <Link
                    key={shop.id}
                    href={`/shop/${shop.slug}`}
                    className="flex bg-white border-2 border-amber-300 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    {/* 썸네일 - 4:3 비율, 크기 대폭 확대 */}
                    <div className="w-36 sm:w-56 aspect-[4/3] shrink-0 bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center border-r border-amber-100">
                      <span className="text-6xl sm:text-7xl opacity-50">
                        {({'swedish':'🌿','aroma':'🌸','thai':'🙏','sport':'💪','deep':'🔥','hot_stone':'💎','foot':'🦶','couple':'👫'})[shop.theme] ?? '✨'}
                      </span>
                    </div>
                    {/* 상세 정보 */}
                    <div className="flex-1 p-3 sm:p-4 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded">AD</span>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{shop.name}</h3>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{shop.tagline}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-amber-700">{formatRating(shop.rating)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />{shop.regionLabel}
                        </span>
                        <span className="text-red-500 font-medium">#{shop.themeLabel}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex gap-1.5 flex-wrap">
                          {shop.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                          ))}
                        </div>
                        {shop.courses[0] && (
                          <span className="text-sm sm:text-base font-black text-red-600">{shop.courses[0].price}~</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ===== 일반 업소 카드형 그리드 ===== */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-800">
                  📋 {sortType === 'popular' ? '인기 추천 업소' : '전체 업소'}
                  {regionLabel !== '전체' && ` · ${regionLabel} ${subRegionLabel}`}
                  {themeLabel && ` · ${themeLabel}`}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">({regularShops.length}개)</span>
              </div>
              <div className="flex items-center gap-2">
                {sortType === 'popular' && (
                  <Link href="/" className="text-[11px] text-red-600 font-bold hover:underline">정렬 초기화</Link>
                )}
                <div className="flex bg-gray-100 rounded-lg p-0.5 mr-1 md:mr-2">
                  <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={doShuffle}
                  disabled={isShuffling}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 bg-gray-50 hover:bg-red-50 px-2 py-1 rounded border border-gray-200"
                >
                  <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin' : ''}`} />
                  랜덤
                </button>
              </div>
            </div>

            {regularShops.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                해당 조건의 업소가 없습니다.
              </div>
            ) : (
              <div className={`shop-grid transition-opacity duration-200 ${isShuffling ? 'opacity-30' : 'opacity-100'} ${viewMode === 'list' ? 'list-view' : 'card-view'}`}>
                {regularShops.map(shop => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </div>

          {/* ===== SEO 하단 텍스트 영역 ===== */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5 seo-content">
            <h1>힐링찾기 - 전국 마사지·힐링업소 디렉토리</h1>
            <p>
              힐링찾기는 전국 마사지·힐링 제휴업소를 지역별·테마별로 한눈에 비교할 수 있는 디렉토리 플랫폼입니다.
              서울, 경기, 부산 등 전국 주요 도시의 검증된 업소를 소개합니다.
            </p>
            <h2>지역별 마사지 업소 찾기</h2>
            <p>
              강남, 홍대, 해운대 등 인기 지역부터 수원, 인천, 대전까지 다양한 지역의 업소를 손쉽게 검색하세요.
              스웨디시, 아로마, 타이, 스포츠 마사지 등 테마별 필터로 원하는 업소를 빠르게 찾을 수 있습니다.
            </p>
            <h2>프리미엄 추천업소</h2>
            <p>
              매일 업데이트되는 프리미엄 추천업소를 통해 최고 수준의 서비스를 경험하세요.
              업소 상세 페이지에서 코스 정보, 요금표, 실제 방문 후기를 확인할 수 있습니다.
            </p>
          </div>

        </div>

        {/* ===== 우측 퀵메뉴 (PC only) ===== */}
        <aside className="hidden lg:block w-[120px] shrink-0">
          <div className="sticky top-[170px] space-y-2 relative z-10">
            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-lg overflow-hidden shadow-sm border-2 border-blue-600 group cursor-pointer hover:shadow-md">
              <div className="bg-pink-500 text-white text-[11px] font-black py-1 text-center animate-pulse">
                프리미엄 입점센터
              </div>
              <div className="p-2 text-center">
                <div className="text-[10px] text-blue-200">전국 제휴업소</div>
                <div className="text-sm font-black mt-1 leading-tight group-hover:scale-105 transition-transform">선착순<br/>모집중</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-center flex flex-col divide-y divide-gray-100">
              <div className="bg-gray-100 py-1.5 text-[11px] font-bold text-gray-700">QUICK MENU</div>
              <Link href="/?view=list" className="py-2 hover:bg-red-50 hover:text-red-600 transition-colors flex flex-col items-center gap-1 group">
                <span className="text-xl group-hover:-translate-y-0.5 transition-transform">📋</span>
                <span className="text-[10px] font-bold">전체업소</span>
              </Link>
              <Link href="/?sort=popular" className="py-2 hover:bg-red-50 hover:text-red-600 transition-colors flex flex-col items-center gap-1 group">
                <span className="text-xl group-hover:-translate-y-0.5 transition-transform">🏆</span>
                <span className="text-[10px] font-bold">인기순위</span>
              </Link>
              <div className="py-2 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">최근 본 업소</span>
                <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-400 flex items-center justify-center">없음</div>
              </div>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full bg-gray-800 text-white font-bold py-2 rounded-lg text-xs hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center gap-1"
            >
              ▲ TOP
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <HomeContent />
    </Suspense>
  );
}
