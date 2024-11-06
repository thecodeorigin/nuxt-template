export interface DrawerConfig {
  isVisible: boolean
  type: 'add' | 'edit'
}

type DialogType = 'warning' | 'info'

export interface DialogConfig {
  isDialogVisible: boolean
  title: string
  label: string
  type: DialogType
}
