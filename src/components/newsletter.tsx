'use client'
import { useState } from 'react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus('success')
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="relative mx-auto my-12 max-w-6xl rounded-xl border bg-gray-800 p-7 md:grid md:grid-cols-2 md:rounded-l-xl md:rounded-r-none md:p-12">
      <div className="max-w-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-100 md:text-3xl">
          Stay Updated with the Latest in Web Development
        </h2>
        <p className="text-md mb-6 font-medium leading-7 text-gray-300 md:text-lg">
          Join our community of passionate developers! <br /> Receive monthly
          updates on the latest tools, frameworks, and techniques that help you
          level up your development stack.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`rounded-lg px-5 py-3 font-semibold text-white transition-colors ${
              status === 'loading'
                ? 'bg-gray-500'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-4 text-green-500">
            Thanks for subscribing! Please confirm your email.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-4 text-red-500">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
      <div
        className="absolute right-0 hidden h-full w-2/5 bg-gradient-to-t from-[#4969b8] to-[#7fa8e0] md:block"
        style={{
          clipPath: 'polygon(0 0, 10% 100%, 100% 100%, 100% 0)',
        }}
      ></div>
    </div>
  )
}

export default Newsletter
