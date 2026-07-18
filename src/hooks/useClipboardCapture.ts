import { useEffect } from 'react'
import { usePersonalizationStore } from '@/store/personalizationStore'

export function useClipboardCapture() {
  useEffect(() => {
    const pushItem = usePersonalizationStore.getState().pushClipboardItem

    function onCopy() {
      const selection = document.getSelection()?.toString()
      if (selection) pushItem(selection)
    }
    document.addEventListener('copy', onCopy)

    const original = navigator.clipboard.writeText.bind(navigator.clipboard)
    navigator.clipboard.writeText = async (text: string) => {
      pushItem(text)
      return original(text)
    }

    return () => {
      document.removeEventListener('copy', onCopy)
      navigator.clipboard.writeText = original
    }
  }, [])
}
