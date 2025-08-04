import { useMutation } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  status?: string;
  created_at: string;
}

export const useExportLeads = () => {
  const exportToExcel = useMutation({
    mutationFn: async ({ leads, dateRange }: { leads: Lead[], dateRange: string }) => {
      const filteredLeads = filterLeadsByDateRange(leads, dateRange);
      
      const worksheetData = filteredLeads.map(lead => ({
        'Name': lead.name,
        'Email': lead.email,
        'Phone': lead.phone || '',
        'Message': lead.message || '',
        'Source': lead.source || '',
        'Status': lead.status || 'new',
        'Created Date': new Date(lead.created_at).toLocaleDateString(),
        'Created Time': new Date(lead.created_at).toLocaleTimeString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      // Auto-size columns
      const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;

      const fileName = `leads-export-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return { count: filteredLeads.length, fileName };
    },
    onSuccess: ({ count, fileName }) => {
      toast.success(`Exported ${count} leads to ${fileName}`);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    }
  });

  const exportToPDF = useMutation({
    mutationFn: async ({ leads, dateRange }: { leads: Lead[], dateRange: string }) => {
      const filteredLeads = filterLeadsByDateRange(leads, dateRange);
      
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Title
      doc.setFontSize(16);
      doc.text('Leads Export Report', 20, yPosition);
      yPosition += 10;

      // Date range
      doc.setFontSize(12);
      doc.text(`Date Range: ${dateRange}`, 20, yPosition);
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, yPosition + 7);
      doc.text(`Total Leads: ${filteredLeads.length}`, 20, yPosition + 14);
      yPosition += 30;

      // Table headers
      doc.setFontSize(10);
      const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Date'];
      const startX = 20;
      const colWidths = [30, 50, 25, 25, 20, 25];
      
      headers.forEach((header, index) => {
        const x = startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.text(header, x, yPosition);
      });
      yPosition += 7;

      // Draw line under headers
      doc.line(20, yPosition, 195, yPosition);
      yPosition += 5;

      // Table rows
      filteredLeads.forEach((lead, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const rowData = [
          lead.name.substring(0, 20),
          lead.email.substring(0, 30),
          lead.phone?.substring(0, 15) || '',
          lead.source?.substring(0, 15) || '',
          lead.status || 'new',
          new Date(lead.created_at).toLocaleDateString()
        ];

        rowData.forEach((data, colIndex) => {
          const x = startX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          doc.text(data, x, yPosition);
        });

        yPosition += 7;
      });

      const fileName = `leads-export-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return { count: filteredLeads.length, fileName };
    },
    onSuccess: ({ count, fileName }) => {
      toast.success(`Exported ${count} leads to ${fileName}`);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    }
  });

  return { exportToExcel, exportToPDF };
};

const filterLeadsByDateRange = (leads: Lead[], dateRange: string): Lead[] => {
  const now = new Date();
  const startDate = new Date();

  switch (dateRange) {
    case '7days':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return leads.filter(lead => new Date(lead.created_at) >= startDate);
};