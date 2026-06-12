import './TextField.css'

/**
 * Labelled text input with optional error message.
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {Function} props.onChange - called with the raw string value
 * @param {string} [props.id]
 * @param {string} [props.type]
 * @param {string} [props.placeholder]
 * @param {string} [props.error] - validation error to display
 */
export default function TextField({
  label,
  value,
  onChange,
  id,
  type = 'text',
  placeholder,
  error
}) {
  return (
    <div className="text-field">
      {label && (
        <label htmlFor={id} className="text-field-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`text-field-input ${error ? 'has-error' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="text-field-error">{error}</span>}
    </div>
  )
}
