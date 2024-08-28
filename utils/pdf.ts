import * as pdfMake from 'pdfmake/build/pdfmake'
import type { Content } from 'pdfmake/interfaces'
import type { Subtitle } from './types/project'

export function createPdf(content: Content) {
  return pdfMake.createPdf(
    {
      content,
      defaultStyle: {
        font: 'Roboto',
      },
      styles: {
        table: {
          margin: [0, 5, 0, 15],
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        link: {
          bold: true,
          color: 'blue',
        },
      },
    },
    {},
    {
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
    },
  )
}

export function templatePdfFromSubtitle(subtitle: Subtitle[], title?: string) {
  return [
    title && { text: `Project subtitles: ${title || 'Untitled'}`, style: 'header' },
    {
      text: [
        'Subtitles generated automatically by ',
        { text: 'import.meta.env.VITE_APP_PUBLIC_NAME', link: 'import.meta.env.VITE_APP_PUBLIC_URL', style: 'link' }, // FIXME: add VITE_APP_PUBLIC_NAME, VITE_APP_PUBLIC_URL
      ],
      marginBottom: 10,
    },
    {
      style: 'table',
      table: {
        widths: [32, 100, 100, '*'],
        body: [
          [
            { text: 'ID', style: 'tableHeader' },
            { text: 'Speaker', style: 'tableHeader' },
            { text: 'Time', style: 'tableHeader' },
            { text: 'Dialogue', style: 'tableHeader' },
          ],
          ...subtitle.map((item, index) => [
            item.id || index,
            item.speaker || '',
            [formatTime(item.start), formatTime(item.end)].join('\n'),
            item.text,
          ]),
        ],
      },
    },
  ] as Content
}
