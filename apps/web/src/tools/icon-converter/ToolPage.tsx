import React from 'react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { useTitle } from '@/hooks/useTitle';
import { useToolState } from '@/hooks/useToolState';
import { DEFAULT_SETTINGS, type IconConverterSettings } from './logic/constants';
import { InputDropzone } from './components/InputDropzone';
import { FileMetaDisplay } from './components/FileMetaDisplay';
import { FormatSelector } from './components/FormatSelector';
import { PresetSelector } from './components/PresetSelector';
import { SizeChecklist } from './components/SizeChecklist';
import { RenderOptionsPanel } from './components/RenderOptionsPanel';
import { GenerateButton } from './components/GenerateButton';
import { PreviewGrid } from './components/PreviewGrid';
import { DownloadPanel } from './components/DownloadPanel';

export const IconConverterToolPage: React.FC = () => {
  useTitle('Icon Converter');

  // 상태 관리
  const { state, updateState, resetState } = useToolState<IconConverterSettings>(
    'icon-converter',
    DEFAULT_SETTINGS,
    {
      // 이미지 데이터는 공유하지 않고 설정만 공유
      shareStateFilter: (s) => ({
        outputFormat: s.outputFormat,
        preset: s.preset,
        sizes: s.sizes,
        fit: s.fit,
        padding: s.padding,
        background: s.background,
        quality: s.quality,
        exportZip: s.exportZip,
        icoMode: s.icoMode,
      }),
    }
  );

  // 파일 입력 상태 (메모리에만 저장, localStorage/URL 공유 제외)
  const [inputFile, setInputFile] = React.useState<File | null>(null);
  const [inputMeta, setInputMeta] = React.useState<{
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
    hasAlpha: boolean;
  } | null>(null);

  // 생성 결과 상태
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentSize, setCurrentSize] = React.useState<number | null>(null);
  const [generatedBlobs, setGeneratedBlobs] = React.useState<
    { size: number; blob: Blob; dataUrl: string }[]
  >([]);
  const [outputBlob, setOutputBlob] = React.useState<Blob | null>(null);

  // 파일 선택 핸들러
  const handleFileSelect = async (file: File) => {
    setInputFile(file);

    // 파일 메타 정보 추출
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      setInputMeta({
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        hasAlpha: file.type.includes('png') || file.type.includes('svg'),
      });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  // Worker 인스턴스
  const workerRef = React.useRef<Worker | null>(null);

  // Worker 초기화
  React.useEffect(() => {
    workerRef.current = new Worker(
      new URL('./logic/iconWorker.ts', import.meta.url),
      { type: 'module' }
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 생성 핸들러
  const handleGenerate = async () => {
    if (!inputFile || !workerRef.current) return;

    setIsGenerating(true);
    setProgress(0);
    setGeneratedBlobs([]);
    setOutputBlob(null);
    setCurrentSize(null);

    const requestId = crypto.randomUUID();

    // Worker 메시지 핸들러
    const handleMessage = (e: MessageEvent) => {
      const response = e.data;

      if (response.id !== requestId) return;

      if (response.type === 'progress') {
        const progressPercent = (response.current / response.total) * 100;
        setProgress(progressPercent);
        // message에서 current size를 추출할 수 있다면 설정
      } else if (response.type === 'success') {
        // 성공: 결과를 state에 저장
        const blobs = response.results.map((r: any) => ({
          size: r.size,
          blob: r.blob,
          dataUrl: r.url,
        }));
        setGeneratedBlobs(blobs);
        setOutputBlob(response.downloadBlob || null);
        setProgress(100);
        setIsGenerating(false);
        setCurrentSize(null);
        workerRef.current?.removeEventListener('message', handleMessage);
      } else if (response.type === 'error') {
        // 에러 처리
        console.error('Worker error:', response.message, response.details);
        setIsGenerating(false);
        setCurrentSize(null);
        workerRef.current?.removeEventListener('message', handleMessage);
        // TODO: Toast 알림으로 에러 표시
      }
    };

    workerRef.current.addEventListener('message', handleMessage);

    // Worker에 변환 요청 전송
    workerRef.current.postMessage({
      id: requestId,
      type: 'convert',
      file: inputFile,
      selectedSizes: state.sizes,
      outputFormat: state.outputFormat,
      renderOptions: {
        fit: state.fit,
        padding: state.padding,
        background: state.background,
        jpegQuality: state.quality / 100,
      },
    });
  };

  // Reset 핸들러
  const handleReset = () => {
    resetState();
    setInputFile(null);
    setInputMeta(null);
    setGeneratedBlobs([]);
    setOutputBlob(null);
    setProgress(0);
    setCurrentSize(null);
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6">
      <div className="max-w-[90rem] mx-auto w-full">
        <ToolHeader
          title="Icon Converter"
          description="Convert SVG/images to ICO, PNG, WebP, JPEG with multi-size presets"
          onReset={handleReset}
        />

        {/* Wide Layout: 좌우 패널 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측 패널: 입력 및 설정 */}
          <div className="space-y-6">
            {/* 파일 입력 */}
            <InputDropzone onFileSelect={handleFileSelect} file={inputFile} />

            {/* 파일 메타 정보 */}
            {inputMeta && <FileMetaDisplay meta={inputMeta} />}

            {/* 출력 포맷 선택 */}
            <FormatSelector
              format={state.outputFormat}
              exportZip={state.exportZip}
              onFormatChange={(format) => updateState({ outputFormat: format })}
              onExportZipChange={(exportZip) => updateState({ exportZip })}
            />

            {/* 프리셋 선택 */}
            <PresetSelector
              preset={state.preset}
              onPresetChange={(preset) => {
                updateState({ preset });
              }}
            />

            {/* 사이즈 선택 */}
            <SizeChecklist
              sizes={state.sizes}
              preset={state.preset}
              onSizesChange={(sizes) => updateState({ sizes })}
            />

            {/* 렌더링 옵션 */}
            <RenderOptionsPanel
              fit={state.fit}
              padding={state.padding}
              background={state.background}
              quality={state.quality}
              outputFormat={state.outputFormat}
              onFitChange={(fit) => updateState({ fit })}
              onPaddingChange={(padding) => updateState({ padding })}
              onBackgroundChange={(background) => updateState({ background })}
              onQualityChange={(quality) => updateState({ quality })}
            />

            {/* 생성 버튼 */}
            <GenerateButton
              isGenerating={isGenerating}
              progress={progress}
              currentSize={currentSize}
              disabled={!inputFile || state.sizes.length === 0}
              onGenerate={handleGenerate}
            />
          </div>

          {/* 우측 패널: 미리보기 및 다운로드 */}
          <div className="space-y-6">
            {/* 미리보기 */}
            <PreviewGrid
              sizes={state.sizes}
              generatedBlobs={generatedBlobs}
              isGenerating={isGenerating}
            />

            {/* 다운로드 */}
            {outputBlob && (
              <DownloadPanel
                outputBlob={outputBlob}
                outputFormat={state.outputFormat}
                fileName={inputFile?.name || 'icon'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

