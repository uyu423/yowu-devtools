import { GoogleAdsense } from './GoogleAdsense';
import React from 'react';

/**
 * AdsenseFooter - 도구 하단에 표시되는 광고 Footer
 *
 * 사용법:
 * 1. 도구 컴포넌트의 최상위 컨테이너에 `min-h-full` 클래스 추가 (h-full → min-h-full)
 * 2. return문 마지막에 <AdsenseFooter /> 추가
 *
 * 동작:
 * - 콘텐츠가 뷰포트보다 작으면: 화면 바닥에 붙음 (mt-auto)
 * - 콘텐츠가 뷰포트보다 크면: 스크롤 맨 끝에 표시
 *
 * @example
 * ```tsx
 * const MyTool: React.FC = () => {
 *   return (
 *     <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
 *       {/\* 도구 콘텐츠 *\/}
 *       <AdsenseFooter />
 *     </div>
 *   );
 * };
 * ```
 */
export const AdsenseFooter: React.FC = () => {
  return (
    <div className="mt-auto pt-6 pb-4">
      <div className="max-w-4xl mx-auto">
        <GoogleAdsense />
      </div>
    </div>
  );
};
