// import React, { useState } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
//     const [numPages, setNumPages] = useState<number | null>(null);

//     const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//         setNumPages(numPages);
//     };

//     return (
//         <div style={{ overflowY: 'auto', height: 'auto', border: '1px solid #ccc' }}>
//             <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
//                 {Array.from(new Array(numPages), (_, index) => (
//                     <Page key={`page_${index + 1}`} scale={1} pageNumber={index + 1} width={window.innerWidth * 0.9} renderTextLayer={false} renderAnnotationLayer={false} />
//                 ))}
//             </Document>
//         </div>
//     );
// }
import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

type PDFViewerProps = {
  pdfUrl: string;
};

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  return (
    <div style={{ height: "800px" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default PDFViewer;