import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFFromHTML = async (htmlContent: string, filename: string = 'invoice.pdf'): Promise<void> => {
  try {
    // Create a temporary container with the HTML content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20mm';
    
    document.body.appendChild(tempContainer);

    // Wait a bit for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight,
    });

    // Clean up the temporary container
    document.body.removeChild(tempContainer);

    // Calculate PDF dimensions (A4: 210 x 297 mm)
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    
    // If content fits on one page
    if (heightLeft <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page handling
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    // Download the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateInvoicePDF = async (invoiceId: string, invoiceNumber: string): Promise<void> => {
  try {
    // Fetch HTML content from the edge function
    const response = await fetch(`https://xvojnnbjnleakecogqnd.supabase.co/functions/v1/generate-invoice-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2b2pubmJqbmxlYWtlY29ncW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTc1MDYsImV4cCI6MjA2OTE5MzUwNn0.-sYUmLS3v52G9MZ6BdElj9aR-_6yugOmJA1OdgBRsEc`
      },
      body: JSON.stringify({ invoiceId })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice HTML');
    }

    const htmlContent = await response.text();
    
    // Generate PDF from HTML
    await generatePDFFromHTML(htmlContent, `invoice-${invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};