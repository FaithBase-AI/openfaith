import { useChat } from '@ai-sdk/react'
import {
  Action,
  Actions,
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  CopyIcon,
  Loader,
  Message,
  MessageContent,
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Response,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { RefreshCcwIcon } from 'lucide-react'
import { Fragment, useState } from 'react'

export const Route = createFileRoute('/_app/ai')({
  component: RouteComponent,
})

function RouteComponent() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
    }),
  })

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage({
      text: message.text || 'Sent with attachments',
    })
    setInput('')
  }

  return (
    <div className='relative mx-auto size-full h-screen max-w-4xl p-6'>
      <div className='flex h-full flex-col'>
        <Conversation className='h-full'>
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' &&
                  message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={message.parts.filter((part) => part.type === 'source-url').length}
                      />
                      {message.parts
                        .filter((part) => part.type === 'source-url')
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source href={part.url} key={`${message.id}-${i}`} title={part.url} />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className='mt-2'>
                              <Action label='Retry' onClick={() => regenerate()}>
                                <RefreshCcwIcon className='size-3' />
                              </Action>
                              <Action
                                label='Copy'
                                onClick={() => navigator.clipboard.writeText(part.text)}
                              >
                                <CopyIcon className='size-3' />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      )
                    case 'reasoning':
                      return (
                        <Reasoning
                          className='w-full'
                          isStreaming={
                            status === 'streaming' &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                          key={`${message.id}-${i}`}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput className='mt-4' globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
