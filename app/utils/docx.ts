import type { ISectionOptions } from 'docx'
import { Document, ExternalHyperlink, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx'
import type { Subtitle } from './types/project'

export function createDocx(sections: ISectionOptions[]) {
  return new Document({
    sections,
  })
}

export function templateDocxFromSubtitle(subtitle: Subtitle[], title?: string) {
  return [
    {
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `Project subtitles: ${title || 'Untitled'}`,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Subtitles generated automatically by ',
            }),
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: 'import.meta.env.VITE_APP_PUBLIC_NAME', // FIXME: add VITE_APP_PUBLIC_NAME
                  color: '0000FF',
                }),
              ],
              link: 'import.meta.env.VITE_APP_PUBLIC_URL', // FIXME: add VITE_APP_PUBLIC_URL
            }),
          ],
        }),
        new Table({
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun('ID')] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun('Speaker')] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun('Time')] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun('Dialogue')] })],
                }),
              ],
            }),
            ...subtitle.map((item, index) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun(String(item.id || index))] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun(item.speaker || '')] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun(formatTime(item.start))] }),
                      new Paragraph({ children: [new TextRun(formatTime(item.end))] }),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun(item.text)] })],
                  }),
                ],
              }),
            ),
          ],
        }),
      ],
    },
  ] as ISectionOptions[]
}
