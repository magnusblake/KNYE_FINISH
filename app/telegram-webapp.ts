export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    chat_instance?: string
    chat_type?: string
    auth_date?: number
    hash?: string
    start_param?: string
  }
  colorScheme?: 'light' | 'dark'
  themeParams?: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isVersionAtLeast: (version: string) => boolean
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  onEvent: (eventType: string, eventHandler: Function) => void
  offEvent: (eventType: string, eventHandler: Function) => void
  sendData: (data: string) => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback: (ok: boolean) => void) => void
  showPopup: (params: { 
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text: string
    }>
    callback: (buttonId: string) => void
  }) => void
  shareUrl: (url: string) => void
  requestWriteAccess: (callback: (access_granted: boolean) => void) => void
  requestContact: (callback: (shared: boolean) => void) => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: Function) => void
    offClick: (callback: Function) => void
    setText: (text: string) => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: Function) => void
    offClick: (callback: Function) => void
  }
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  platform?: string
  version?: string
  viewportHeight?: number
  viewportStableHeight?: number
  isExpanded?: boolean
  CloudStorage?: {
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void
    setItem: (key: string, value: string, callback: (error: Error | null) => void) => void
    removeItem: (key: string, callback: (error: Error | null) => void) => void
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string | null>) => void) => void
    removeItems: (keys: string[], callback: (error: Error | null) => void) => void
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}