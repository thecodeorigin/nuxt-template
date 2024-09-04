import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

export function removePTags(html: string): string {
  // Remove empty <p> tags from tiptap editor
  return html.replace(/<p>\s*<\/p>/g, '')
}
