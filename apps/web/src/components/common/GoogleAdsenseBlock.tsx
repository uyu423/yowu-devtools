import React from 'react';
import { GoogleAdsense } from './GoogleAdsense';

/**
 * GoogleAdsenseBlock - 페이지 내 임의 위치에 표시되는 광고 블록
 *
 * 사용법:
 * - 도구 콘텐츠 중간의 적절한 위치에 삽입
 * - 입력 폼 하단, 결과 블록 상단 등 자연스러운 위치에 배치
 *
 * 차이점:
 * - AdsenseFooter: 페이지 하단에 고정 (mt-auto 사용)
 * - GoogleAdsenseBlock: 페이지 중간에 자유롭게 배치 가능
 */
export const GoogleAdsenseBlock: React.FC = () => {
  return (
    <div className="my-6">
      <div className="max-w-4xl mx-auto">
        <GoogleAdsense />
      </div>
    </div>
  );
};
