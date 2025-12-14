import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { tools } from '@/tools';
import { Toaster } from 'sonner';

function App() {
  return (
    <AppLayout>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={
          <div className="p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Welcome to yowu-devtools</h1>
            <p className="text-gray-600 mb-8">
              개발자에게 필요한 유용한 도구 모음입니다. 왼쪽 사이드바에서 도구를 선택하세요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map(tool => (
                <a 
                  key={tool.id} 
                  href={`#${tool.path}`}
                  className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-lg mb-1">{tool.title}</div>
                  <div className="text-sm text-gray-500">{tool.description}</div>
                </a>
              ))}
            </div>
          </div>
        } />
        
        {/* Dynamic Routes for Tools */}
        {tools.map(tool => (
          <Route 
            key={tool.id} 
            path={tool.path} 
            element={<tool.Component />} 
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
