import { useState } from 'react'
import { HiChat } from 'react-icons/hi'
import { Button } from '@/components/shared'
import SendSmsModal from '../components/SendSmsModal'

export default function SendSmsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Send SMS</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Send SMS messages to one or more salons</p>
        </div>
        <Button onClick={() => setModalOpen(true)} leftIcon={<HiChat size={15} />}>
          Send SMS
        </Button>
      </div>

      <SendSmsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}