/**
 * BoQConverter - Excel to BOQ Data Converter
 * Converts Excel files (.xlsx, .xls) to structured BOQ data
 */

import * as XLSX from 'xlsx';
import type { BoQData, BoQItem, BoQSummary } from '../types';

export class BoQConverter {
  /**
   * Convert Excel file to BOQ data
   * Expects Excel columns: No, Description, Unit, Quantity, Unit Price, Total Price (optional)
   */
  static async convertExcelToBoQ(file: File): Promise<BoQData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Parse data
          const boqData = this.parseExcelData(jsonData);
          resolve(boqData);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Parse Excel data array to BOQ structure
   */
  private static parseExcelData(data: any[][]): BoQData {
    console.log('=== PARSING EXCEL DATA ===');
    console.log('Total rows:', data.length);
    
    if (data.length < 2) {
      throw new Error('Excel file is empty or has insufficient data');
    }

    // Log first few rows for debugging
    console.log('First 5 rows:', data.slice(0, 5));

    // Find header row (look for common BOQ headers)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const rowStr = row.join('').toLowerCase();
      console.log(`Row ${i}:`, rowStr.substring(0, 100));
      
      if (rowStr.includes('no') || rowStr.includes('description') || rowStr.includes('unit') || 
          rowStr.includes('deskripsi') || rowStr.includes('uraian') || rowStr.includes('qty')) {
        headerRowIndex = i;
        console.log('Header found at row:', i);
        break;
      }
    }

    const headers = data[headerRowIndex].map((h: any) => 
      String(h || '').toLowerCase().trim()
    );
    
    console.log('Headers:', headers);

    // Find column indices with more flexible matching
    const noIndex = this.findColumnIndex(headers, ['no', 'item', 'nomor', '#']);
    const descIndex = this.findColumnIndex(headers, ['description', 'deskripsi', 'uraian', 'item name', 'pekerjaan', 'nama']);
    const unitIndex = this.findColumnIndex(headers, ['unit', 'satuan', 'uom']);
    const qtyIndex = this.findColumnIndex(headers, ['quantity', 'qty', 'jumlah', 'volume', 'vol']);
    const unitPriceIndex = this.findColumnIndex(headers, ['unit price', 'harga satuan', 'price', 'harga']);
    const totalPriceIndex = this.findColumnIndex(headers, ['total price', 'total', 'harga total', 'amount', 'jumlah harga']);
    const categoryIndex = this.findColumnIndex(headers, ['category', 'kategori', 'type', 'tipe', 'jenis']);

    console.log('Column indices:', {
      no: noIndex,
      description: descIndex,
      unit: unitIndex,
      quantity: qtyIndex,
      unitPrice: unitPriceIndex,
      totalPrice: totalPriceIndex,
      category: categoryIndex
    });

    // If no description column found, try to use first text column or column index 1
    let finalDescIndex = descIndex;
    if (descIndex < 0) {
      console.warn('Description column not found by name, trying fallback...');
      // Try to find first non-numeric column after column 0
      for (let colIdx = 1; colIdx < Math.min(headers.length, 5); colIdx++) {
        const sampleValue = data[headerRowIndex + 1]?.[colIdx];
        if (sampleValue && typeof sampleValue === 'string' && sampleValue.trim().length > 3) {
          finalDescIndex = colIdx;
          console.log('Using column', colIdx, 'as description (fallback)');
          break;
        }
      }
    }

    // Fallback: If still not found, assume standard BOQ layout (No, Desc, Unit, Qty, Price, Total)
    if (finalDescIndex < 0 && headers.length >= 3) {
      finalDescIndex = 1; // Second column typically contains description
      console.log('Using column 1 as description (default fallback)');
    }

    // Parse items
    const items: BoQItem[] = [];
    let materialCost = 0;
    let laborCost = 0;
    let skippedRows = 0;

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || row.every((cell: any) => !cell)) {
        skippedRows++;
        continue;
      }

      // Extract values
      const noValue = noIndex >= 0 ? row[noIndex] : i - headerRowIndex;
      const description = finalDescIndex >= 0 ? String(row[finalDescIndex] || '').trim() : '';
      const unit = unitIndex >= 0 ? String(row[unitIndex] || '').trim() : 'unit';
      const quantity = qtyIndex >= 0 ? this.parseNumber(row[qtyIndex]) : 0;
      const unitPrice = unitPriceIndex >= 0 ? this.parseNumber(row[unitPriceIndex]) : 0;
      const totalPrice = totalPriceIndex >= 0 
        ? this.parseNumber(row[totalPriceIndex]) 
        : quantity * unitPrice;
      const category = categoryIndex >= 0 ? String(row[categoryIndex] || '').toLowerCase() : '';

      console.log(`Row ${i}:`, {
        description: description.substring(0, 50),
        quantity,
        unitPrice,
        totalPrice,
        isEmpty: !description
      });

      // Skip if description is empty
      if (!description) {
        skippedRows++;
        continue;
      }

      // Parse item number
      let no = typeof noValue === 'number' ? noValue : items.length + 1;
      if (typeof noValue === 'string') {
        const parsed = parseInt(noValue);
        if (!isNaN(parsed)) {
          no = parsed;
        }
      }

      // Categorize costs
      const descLower = description.toLowerCase();
      if (descLower.includes('labor') || descLower.includes('pekerja') || descLower.includes('upah')) {
        laborCost += totalPrice;
      } else if (descLower.includes('material') || descLower.includes('bahan')) {
        materialCost += totalPrice;
      } else {
        // Default to material cost
        materialCost += totalPrice;
      }

      items.push({
        no,
        description,
        unit,
        quantity,
        unitPrice,
        totalPrice,
        category: category || undefined,
      });
    }

    console.log('Parsing complete:');
    console.log('- Total items found:', items.length);
    console.log('- Skipped rows:', skippedRows);
    console.log('- Total cost:', items.reduce((sum, item) => sum + item.totalPrice, 0));

    if (items.length === 0) {
      console.error('No items found! Possible reasons:');
      console.error('- Description column not found or empty');
      console.error('- All rows were skipped');
      console.error('- Header row index:', headerRowIndex);
      console.error('- Description column index:', finalDescIndex);
      console.error('- Headers:', headers);
      throw new Error('No valid BOQ items found in Excel file');
    }

    // Calculate summary
    const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const summary: BoQSummary = {
      totalItems: items.length,
      totalCost,
      materialCost,
      laborCost,
    };

    return {
      projectName: this.extractProjectName(data, headerRowIndex),
      items,
      summary,
    };
  }

  /**
   * Find column index by possible header names
   */
  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.includes(name));
      if (index >= 0) return index;
    }
    return -1;
  }

  /**
   * Parse number from various formats
   */
  private static parseNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remove currency symbols, spaces, and convert comma to dot
      const cleaned = value.replace(/[Rp$€£,\s]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }

  /**
   * Try to extract project name from Excel data
   */
  private static extractProjectName(data: any[][], headerRowIndex: number): string | undefined {
    // Look for project name in first few rows
    for (let i = 0; i < Math.min(headerRowIndex, 5); i++) {
      const row = data[i];
      const rowStr = row.join(' ').toLowerCase();
      
      if (rowStr.includes('project') || rowStr.includes('proyek')) {
        // Return the content after the label
        const content = row.slice(1).join(' ').trim();
        if (content) return content;
      }
    }
    
    return undefined;
  }

  /**
   * Validate Excel file
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!validTypes.includes(file.type) && !hasValidExtension) {
      return {
        valid: false,
        error: 'File harus berformat Excel (.xlsx atau .xls)',
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Ukuran file tidak boleh lebih dari 5MB',
      };
    }

    return { valid: true };
  }
}
