import html2canvas from 'html2canvas';

export async function exportHeatmapToPng(elementId = 'heatmap-container', fileName = 'progressmap-heatmap.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0d121c',
      scale: 2, // High resolution
      logging: false,
      useCORS: true,
    });

    const image = canvas.toDataURL('image/png', 1.0);
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting heatmap:', error);
  }
}
