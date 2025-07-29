import { Paragraph, TextRun, HeadingLevel } from 'docx';

export function parseHtmlToDocxElements(html: string): Paragraph[] {
  // Simple HTML to DOCX converter for basic formatting
  const paragraphs: Paragraph[] = [];
  
  // Remove HTML tags and extract text with basic formatting
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  interface TextRun {
    text: string;
    formatting: {
      bold?: boolean;
      italics?: boolean;
      underline?: object;
      strike?: boolean;
    };
  }

  function processNode(node: Node): TextRun[] {
    const result: TextRun[] = [];
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      // Preserve all whitespace, including spaces
      if (text) {
        result.push({ text, formatting: {} });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Process child nodes first
      const childResults: TextRun[] = [];
      for (const child of Array.from(node.childNodes)) {
        childResults.push(...processNode(child));
      }
      
      // Apply formatting based on tag
      switch (tagName) {
        case 'strong':
        case 'b':
          childResults.forEach(child => child.formatting.bold = true);
          break;
        case 'em':
        case 'i':
          childResults.forEach(child => child.formatting.italics = true);
          break;
        case 'u':
          childResults.forEach(child => child.formatting.underline = {});
          break;
        case 'strike':
        case 's':
          childResults.forEach(child => child.formatting.strike = true);
          break;
      }
      
      result.push(...childResults);
    }
    
    return result;
  }
  
  function processElement(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
        const h1Runs = processNode(element);
        if (h1Runs.length > 0) {
          paragraphs.push(new Paragraph({
            children: h1Runs.map(run => new TextRun({ ...run.formatting, text: run.text, size: 32 })),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }));
        }
        break;
        
      case 'h2':
        const h2Runs = processNode(element);
        if (h2Runs.length > 0) {
          paragraphs.push(new Paragraph({
            children: h2Runs.map(run => new TextRun({ ...run.formatting, text: run.text, size: 28 })),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 }
          }));
        }
        break;
        
      case 'h3':
        const h3Runs = processNode(element);
        if (h3Runs.length > 0) {
          paragraphs.push(new Paragraph({
            children: h3Runs.map(run => new TextRun({ ...run.formatting, text: run.text, size: 24 })),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 250, after: 125 }
          }));
        }
        break;
        
      case 'p':
        const pRuns = processNode(element);
        if (pRuns.length > 0) {
          // Filter out empty runs but preserve runs with just spaces
          const validRuns = pRuns.filter(run => run.text !== '');
          if (validRuns.length > 0) {
            paragraphs.push(new Paragraph({
              children: validRuns.map(run => new TextRun({ ...run.formatting, text: run.text, size: 22 })),
              spacing: { after: 200 }
            }));
          } else {
            // Empty paragraph for spacing
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: '', size: 22 })],
              spacing: { after: 200 }
            }));
          }
        } else {
          // Empty paragraph for spacing
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: '', size: 22 })],
            spacing: { after: 200 }
          }));
        }
        break;
        
      case 'blockquote':
        const quoteRuns = processNode(element);
        if (quoteRuns.length > 0) {
          paragraphs.push(new Paragraph({
            children: quoteRuns.map(run => new TextRun({ 
              ...run.formatting, 
              text: run.text, 
              size: 22,
              italics: true,
              color: '666666'
            })),
            spacing: { after: 200, before: 200 }
          }));
        }
        break;
        
      case 'ul':
      case 'ol':
        // Process list items
        const listItems = element.querySelectorAll('li');
        listItems.forEach((li, index) => {
          const liRuns = processNode(li);
          if (liRuns.length > 0) {
            const bullet = tagName === 'ul' ? '• ' : `${index + 1}. `;
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({ text: bullet, size: 22 }),
                ...liRuns.map(run => new TextRun({ ...run.formatting, text: run.text, size: 22 }))
              ],
              spacing: { after: 150 }
            }));
          }
        });
        break;
        
      case 'br':
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: '', size: 22 })],
          spacing: { after: 100 }
        }));
        break;
        
      default:
        // Process child elements
        for (const child of Array.from(element.children)) {
          processElement(child);
        }
        break;
    }
  }
  
  // Process all elements in the document body
  for (const element of Array.from(doc.body.children)) {
    processElement(element);
  }
  
  // If no paragraphs were created, create a default one with the text content
  if (paragraphs.length === 0) {
    const textContent = doc.body.textContent?.trim() || '';
    if (textContent) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: textContent, size: 22 })],
        spacing: { after: 200 }
      }));
    }
  }
  
  return paragraphs;
}