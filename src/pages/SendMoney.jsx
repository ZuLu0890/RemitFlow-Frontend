import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextField from '../components/TextField.jsx'
import CurrencySelect from '../components/CurrencySelect.jsx'
import QuoteCard from '../components/QuoteCard.jsx'
import Button from '../components/Button.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { buildQuote } from '../services/quote.js'
import { isPositiveAmount, validateRecipient } from '../utils/validate.js'
import { useWallet } from '../hooks/useWallet.js'
import { useTransfers } from '../hooks/useTransfers.js'
import { DEFAULT_SOURCE, DEFAULT_DEST } from '../constants/currencies.js'
import './SendMoney.css'

/**
 * Send Money page: recipient + amount form with a live FX quote.
 */
export default function SendMoney() {
  const navigate = useNavigate()
  const { isConnected, connect } = useWallet()
  const { addTransfer } = useTransfers()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState(DEFAULT_SOURCE)
  const [to, setTo] = useState(DEFAULT_DEST)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Recompute the quote whenever the inputs change.
  const quote = useMemo(() => {
    if (!isPositiveAmount(amount)) return null
    return buildQuote(amount, from, to)
  }, [amount, from, to])

  function swapCurrencies() {
    setFrom(to)
    setTo(from)
  }

  function validate() {
    const next = {}
    if (!validateRecipient(recipient)) {
      next.recipient = 'Enter a valid email or Stellar address.'
    }
    if (!isPositiveAmount(amount)) {
      next.amount = 'Enter an amount greater than zero.'
    }
    if (from === to) {
      next.to = 'Source and destination must differ.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    if (!isConnected) {
      await connect()
    }

    setSubmitting(true)
    try {
      await addTransfer({
        recipient,
        from,
        to,
        sendAmount: quote.sendAmount,
        receiveAmount: quote.receiveAmount
      })
      navigate('/transfers')
    } catch (err) {
      setSubmitError('Could not submit the transfer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="send-money">
      <h1 className="page-title">Send Money</h1>

      <div className="send-grid">
        <form className="send-form" onSubmit={handleSubmit}>
          <TextField
            id="recipient"
            label="Recipient (email or Stellar address)"
            value={recipient}
            onChange={setRecipient}
            placeholder="amina@example.com"
            error={errors.recipient}
          />

          <TextField
            id="amount"
            label="Amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            error={errors.amount}
          />

          <div className="send-currencies">
            <CurrencySelect
              id="from"
              label="From"
              value={from}
              onChange={setFrom}
            />
            <button
              type="button"
              className="send-swap"
              onClick={swapCurrencies}
              aria-label="Swap currencies"
              title="Swap currencies"
            >
              ⇄
            </button>
            <CurrencySelect
              id="to"
              label="To"
              value={to}
              onChange={setTo}
            />
          </div>
          {errors.to && <span className="send-field-error">{errors.to}</span>}

          {submitError && <ErrorMessage message={submitError} />}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Review & Send'}
          </Button>
        </form>

        <div className="send-quote">
          {quote ? (
            <QuoteCard quote={quote} />
          ) : (
            <p className="send-quote-hint">
              Enter an amount to see your quote.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
