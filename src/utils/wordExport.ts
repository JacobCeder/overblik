import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { NewsOverview } from '@/types';
import { parseHtmlToDocxElements } from './htmlToDocx';

export const exportToWord = async (overview: NewsOverview): Promise<void> => {
  try {
    const docElements: Paragraph[] = [];
    
    // Add title
    docElements.push(new Paragraph({
      children: [
        new TextRun({
          text: overview.title,
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: {
        after: 200,
      },
    }));
    
    // Add description if exists
    if (overview.description) {
      docElements.push(new Paragraph({
        children: [
          new TextRun({
            text: overview.description,
            italics: true,
            size: 24,
          }),
        ],
        spacing: {
          after: 400,
        },
      }));
    }

    // Add generation date
    docElements.push(new Paragraph({
      children: [
        new TextRun({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          size: 20,
          color: '666666',
        }),
      ],
      spacing: {
        after: 600,
      },
    }));

    // Add articles
    overview.articles.forEach((article, index) => {
      // Article heading
      docElements.push(new Paragraph({
        children: [
          new TextRun({
            text: article.heading,
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: {
          before: 400,
          after: 200,
        },
      }));

      // Article subheading
      docElements.push(new Paragraph({
        children: [
          new TextRun({
            text: article.subheading,
            bold: true,
            size: 22,
            color: '333333',
          }),
        ],
        spacing: {
          after: 200,
        },
      }));

      // Author and date
      docElements.push(new Paragraph({
        children: [
          new TextRun({
            text: `By ${article.author} • ${article.date.toLocaleDateString()}`,
            size: 18,
            color: '666666',
            italics: true,
          }),
        ],
        spacing: {
          after: 300,
        },
      }));

      // Source information if available
      if (article.mediaName || article.mediaUrl) {
        const mediaText = article.mediaName 
          ? `Source: ${article.mediaName}${article.mediaUrl ? ` - ${article.mediaUrl}` : ''}`
          : `Source: ${article.mediaUrl}`;
          
        docElements.push(new Paragraph({
          children: [
            new TextRun({
              text: mediaText,
              size: 18,
              color: '666666',
              italics: true,
            }),
          ],
          spacing: {
            after: 200,
          },
        }));
      }

      // Article body - parse HTML content
      const bodyParagraphs = parseHtmlToDocxElements(article.body);
      docElements.push(...bodyParagraphs);

      // Add separator between articles
      if (index < overview.articles.length - 1) {
        docElements.push(new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              color: 'CCCCCC',
            }),
          ],
          spacing: {
            before: 400,
            after: 400,
          },
        }));
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: docElements,
      }],
    });

    const buffer = await Packer.toBlob(doc);
    const fileName = `${overview.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    
    saveAs(buffer, fileName);
  } catch (error) {
    console.error('Failed to export to Word:', error);
    throw new Error('Failed to export to Word document');
  }
};