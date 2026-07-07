// @ts-ignore - Используем pdfjsLib без проверки типов
import * as pdfjsLib from 'pdfjs-dist/webpack';

// Определяем типы для данных PDF.js
interface TextItem {
  str: string;
  [key: string]: any;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Process all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Determine error type and return appropriate message
    if (error instanceof Error) {
      if (error.message.includes('worker')) {
        throw new Error('PDF processor initialization error. Please refresh the page and try again');
      } else if (error.message.includes('Invalid PDF structure')) {
        throw new Error('Invalid PDF file structure. The file might be corrupted');
      } else if (error.message.includes('Password')) {
        throw new Error('PDF file is password protected. Please provide an unprotected version');
      }
    }
    
    // If error type is not determined, return general message
    throw new Error(`Failed to extract text from PDF file: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function validatePdfSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
} 