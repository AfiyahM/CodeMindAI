'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
// @ts-ignore: optional runtime-only dependency without local type declarations
import { Canvg } from 'canvg';
// @ts-ignore: optional runtime-only dependency without local type declarations
import { jsPDF } from 'jspdf';

// Initialize Mermaid globally
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

interface MermaidChartProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // ===================================================================
  // HELPER FUNCTIONS
  // ===================================================================

  /**
   * Wait for all fonts to be loaded
   */
  const waitForFonts = async (): Promise<void> => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Extra safety delay
    return new Promise(resolve => setTimeout(resolve, 150));
  };

  /**
   * Get reliable SVG dimensions
   */
  const getSVGDimensions = (svgElement: SVGSVGElement): { width: number; height: number } => {
    // Priority 1: Check viewBox (most reliable)
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const [, , width, height] = viewBox.split(' ').map(Number);
      if (width && height && width > 0 && height > 0) {
        return { width, height };
      }
    }

    // Priority 2: Check width/height attributes
    const widthAttr = svgElement.getAttribute('width');
    const heightAttr = svgElement.getAttribute('height');
    if (widthAttr && heightAttr) {
      const width = parseFloat(widthAttr);
      const height = parseFloat(heightAttr);
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }

    // Priority 3: Try getBBox (can be unreliable)
    try {
      const bbox = svgElement.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        return { width: bbox.width, height: bbox.height };
      }
    } catch (e) {
      console.warn('getBBox failed:', e);
    }

    // Priority 4: Check client dimensions
    if (svgElement.clientWidth > 0 && svgElement.clientHeight > 0) {
      return {
        width: svgElement.clientWidth,
        height: svgElement.clientHeight
      };
    }

    // Fallback: Default dimensions
    console.warn('Could not determine SVG dimensions, using defaults');
    return { width: 1200, height: 800 };
  };

  /**
   * Clone SVG with all computed styles preserved
   */
  const cloneSVGWithStyles = (svgElement: SVGSVGElement): string => {
    // Clone the element
    const cloned = svgElement.cloneNode(true) as SVGSVGElement;

    // Get all elements in both original and clone
    const allElements = cloned.querySelectorAll('*');
    const originalElements = svgElement.querySelectorAll('*');

    // Copy computed styles to inline styles
    allElements.forEach((element, index) => {
      const originalElement = originalElements[index];
      if (originalElement) {
        const computedStyle = window.getComputedStyle(originalElement);
        
        // Important style properties for text rendering
        const criticalStyles = [
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'fill',
          'stroke',
          'stroke-width',
          'opacity',
          'color'
        ];

        criticalStyles.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none' && value !== 'normal') {
            (element as HTMLElement).style.setProperty(prop, value, 'important');
          }
        });
      }
    });

    // Ensure proper dimensions on root SVG
    const { width, height } = getSVGDimensions(svgElement);
    cloned.setAttribute('width', String(width));
    cloned.setAttribute('height', String(height));
    
    const viewBox = cloned.getAttribute('viewBox');
    if (!viewBox) {
      cloned.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // Serialize to string
    return new XMLSerializer().serializeToString(cloned);
  };

  // ===================================================================
  // EXPORT HANDLERS
  // ===================================================================

  /**
   * Main export function
   */
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    setExporting(format);

    try {
      // Get the SVG element
      const svgElement = document.querySelector('.mermaid-output svg') as SVGSVGElement;
      if (!svgElement) {
        throw new Error('No SVG diagram found to export.');
      }

      // Wait for fonts to be fully loaded
      await waitForFonts();

      // Get dimensions
      const { width, height } = getSVGDimensions(svgElement);
      console.log(`Exporting ${format}: ${width}x${height}`);

      // ============================================
      // SVG EXPORT
      // ============================================
      if (format === 'svg') {
        const svgData = cloneSVGWithStyles(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `mermaid-diagram-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExporting(null);
        return;
      }

      // ============================================
      // PNG EXPORT
      // ============================================
      if (format === 'png') {
        const svgData = cloneSVGWithStyles(svgElement);

        // Create high-res canvas
        const scale = 2; // 2x for retina quality
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas 2D context');
        }

        // High-quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill background (dark theme)
        ctx.fillStyle = '#1a1a1a'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale for high DPI
        ctx.scale(scale, scale);

        // Render SVG to canvas using Canvg
        const v = await Canvg.from(ctx, svgData, {
          ignoreMouse: true,
          ignoreAnimation: true,
          ignoreDimensions: false,
          ignoreClear: true,
          offsetX: 0,
          offsetY: 0,
          scaleWidth: width,
          scaleHeight: height
        });

        await v.render();

        // Convert to PNG and download
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error('Failed to create PNG blob');
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mermaid-diagram-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExporting(null);
          },
          'image/png',
          1.0 // Maximum quality
        );

        return;
      }

      // ============================================
      // PDF EXPORT
      // ============================================
      if (format === 'pdf') {
        const svgData = cloneSVGWithStyles(svgElement);

        // Create canvas
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas 2D context');
        }

        // Rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Dark background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.scale(scale, scale);

        // Render SVG
        const v = await Canvg.from(ctx, svgData, {
          ignoreMouse: true,
          ignoreAnimation: true,
          ignoreDimensions: false,
          ignoreClear: true,
          offsetX: 0,
          offsetY: 0,
          scaleWidth: width,
          scaleHeight: height
        });

        await v.render();

        // Convert to image data
        const imgData = canvas.toDataURL('image/png', 1.0);

        // Create PDF
        const orientation = width > height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [width, height],
          compress: true
        });

        pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'FAST');
        pdf.save(`mermaid-diagram-${Date.now()}.pdf`);

        setExporting(null);
        return;
      }

    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}\n\nCheck console for details.`);
      setExporting(null);
    }
  };

  // ===================================================================
  // RENDER CHART
  // ===================================================================

  useEffect(() => {
    const renderChart = async () => {
      setError(null);
      if (!chart) return;

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Validate and render
        const isValid = await mermaid.parse(chart);
        if (isValid) {
          const { svg } = await mermaid.render(id, chart);
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Failed to render diagram syntax.');
      }
    };

    renderChart();
  }, [chart]);

  // ===================================================================
  // RENDER UI
  // ===================================================================

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-red-900/50 rounded bg-red-900/10 h-full">
        <p className="text-red-400 font-mono text-sm mb-2">⚠️ Rendering Error</p>
        <p className="text-gray-500 text-xs font-mono max-w-md break-words">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center">
      {/* Export Toolbar */}
      <div className="flex gap-2 mb-4 items-center justify-end w-full px-4">
        <span className="font-mono text-xs text-gray-400 mr-2">Export:</span>
        
        <button
          className="px-3 py-1.5 rounded bg-gray-800 text-xs text-white hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!!exporting || !svgContent}
          onClick={() => handleExport('svg')}
        >
          {exporting === 'svg' ? '⏳ SVG' : '📄 SVG'}
        </button>

        <button
          className="px-3 py-1.5 rounded bg-gray-800 text-xs text-white hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!!exporting || !svgContent}
          onClick={() => handleExport('png')}
        >
          {exporting === 'png' ? '⏳ PNG' : '🖼️ PNG'}
        </button>

        <button
          className="px-3 py-1.5 rounded bg-gray-800 text-xs text-white hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!!exporting || !svgContent}
          onClick={() => handleExport('pdf')}
        >
          {exporting === 'pdf' ? '⏳ PDF' : '📑 PDF'}
        </button>

        {exporting && (
          <span className="ml-2 text-xs text-blue-400 animate-pulse">
            Exporting {exporting.toUpperCase()}...
          </span>
        )}
      </div>

      {/* Diagram Display */}
      <div className="w-full min-h-full flex justify-center items-start overflow-auto p-4">
        {svgContent ? (
          <div 
            className="mermaid-output"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        ) : (
          <div className="text-gray-500 text-sm font-mono">
            Generating diagram...
          </div>
        )}
      </div>
    </div>
  );
}