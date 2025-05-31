import { useEffect, useState } from 'react'

export function usePasteDetect() {
  const [pastedContent, setPastedContent] = useState<
    string | Array<File> | Record<string, string> | null
  >(null)
  const [pasteType, setPasteType] = useState<Array<string> | null>(null)

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Get the clipboard data
      const clipboardData = event.clipboardData

      if (clipboardData) {
        // Store the paste type (text, files, etc)
        const types = Array.from(clipboardData.types)
        setPasteType(types)

        // Handle different types of content
        if (clipboardData.types.includes('text/plain')) {
          setPastedContent(clipboardData.getData('text/plain'))
        } else if (clipboardData.types.includes('Files')) {
          const files = Array.from(clipboardData.files)
          setPastedContent(files)
        } else {
          // For other formats, store all available data
          const content: Record<string, string> = {}
          types.forEach((type) => {
            content[type] = clipboardData.getData(type)
          })
          setPastedContent(content)
        }
      }
    }

    // Add paste event listener
    window.addEventListener('paste', handlePaste)

    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  // Reset function to clear the paste state
  const resetPasteContent = () => {
    setPastedContent(null)
    setPasteType(null)
  }

  return {
    pastedContent,
    pasteType,
    resetPasteContent,
  }
}
