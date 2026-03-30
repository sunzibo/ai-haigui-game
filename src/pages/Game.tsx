import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { STORIES } from '../data/stories'
import { askAI } from '../utils/api'

type TChatRole = 'user' | 'host'
type TChatMessage = {
  id: string
  role: TChatRole
  content: string
}

function Game() {
  const { id } = useParams<{ id: string }>()
  const story = STORIES.find((item) => item.id === id)

  if (!story) {
    return (
      <div className="min-h-svh bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-2xl border border-amber-500/40 bg-slate-800/80 p-6 shadow-lg">
            <h1 className="text-2xl font-semibold text-amber-400">故事不存在</h1>
            <p className="mt-3 text-slate-300">你访问的故事 ID 无效或已被移除。</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // 每次消息变化后滚动到底部
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const makeId = () =>
    `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
      .toString(16)
      .slice(2)}`

  const sendMessage = async () => {
    if (isLoading) return
    const content = inputValue.trim()
    if (!content) return

    setErrorText('')
    setInputValue('')
    const userMsg: TChatMessage = { id: makeId(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const result = await askAI(content, story)
    const hostMsg: TChatMessage = {
      id: makeId(),
      role: 'host',
      content: result.answer,
    }
    setMessages((prev) => [...prev, hostMsg])
    setIsLoading(false)

    if (result.error) setErrorText(result.error)
  }

  return (
    <div className="min-h-svh bg-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col px-4 py-8">
        <header className="mb-6 border-b border-amber-500/30 pb-4">
          <h1 className="text-2xl font-semibold text-amber-400">游戏页面</h1>
          <p className="mt-1 text-sm text-slate-300">{story.title}</p>
          <p className="mt-1 text-sm text-slate-400">难度：{story.difficulty}</p>
        </header>

        <section
          aria-label="汤面"
          className="mb-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 shadow-lg"
        >
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">
            汤面
          </h2>
          <p className="text-slate-200">{story.surface}</p>
        </section>

        <section
          aria-label="聊天"
          className="mb-6 flex min-h-[200px] flex-1 flex-col rounded-2xl border border-slate-700 bg-slate-950/40 p-4 shadow-lg"
        >
          <h2 className="mb-3 text-sm font-medium text-slate-400">对话</h2>

          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/20 p-3 pr-2">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-500">
                  请输入你的问题，主持人只会回答：是 / 否 / 无关
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === 'user'
                          ? 'flex justify-end'
                          : 'flex justify-start'
                      }
                    >
                      <div
                        className={
                          m.role === 'user'
                            ? 'max-w-[80%] rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 shadow'
                            : 'max-w-[80%] rounded-2xl border border-slate-600/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 shadow'
                        }
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl border border-slate-600/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-400 shadow">
                        思考中...
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={inputValue}
                placeholder="请输入你的问题..."
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isLoading}
                className="rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? '发送中...' : '发送'}
              </button>
            </div>
            {errorText && <p className="pt-2 text-xs text-rose-300">{errorText}</p>}
          </div>
        </section>

        <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-700 pt-6">
          <Link
            to={`/result/${story.id}`}
            className="rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 shadow-lg transition hover:bg-amber-500/20"
          >
            查看汤底
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
          >
            结束游戏
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Game
