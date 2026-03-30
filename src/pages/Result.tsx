import { Link, useParams } from 'react-router-dom'
import { STORIES } from '../data/stories'

function Result() {
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

  return (
    <div className="min-h-svh bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8 border-b border-amber-500/30 pb-6">
          <h1 className="text-2xl font-semibold text-amber-400">结果页面</h1>
          <p className="mt-1 text-sm text-slate-300">{story.title}</p>
          <p className="mt-1 text-sm text-slate-400">难度：{story.difficulty}</p>
        </header>

        <section
          aria-label="汤底"
          className="mb-10 rounded-2xl border border-amber-500/40 bg-slate-800/80 p-6 shadow-lg"
        >
          <h2 className="mb-3 text-lg font-medium text-amber-300">汤底</h2>
          <p className="leading-relaxed text-slate-200">{story.bottom}</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/game/${story.id}`}
            className="inline-flex rounded-lg border border-amber-500 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-400 shadow-lg transition hover:bg-amber-500/20"
          >
            再来一局
          </Link>
          <Link
            to="/"
            className="inline-flex rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Result
