import { Link } from 'react-router-dom'
import { STORIES } from '../data/stories'

function Home() {
  return (
    <div className="min-h-svh bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-10 border-b border-amber-500/30 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-amber-400 md:text-4xl">
            AI海龟汤
          </h1>
          <p className="mt-4 text-slate-300">
            选择一个故事，阅读汤面，通过提问推理真相。主持人只会回答：是、否或无关。
          </p>
        </header>

        <section aria-label="故事列表">
          <h2 className="mb-4 text-lg font-medium text-slate-200">故事列表</h2>
          <p className="mb-4 text-sm text-slate-400">请选择一个故事开始推理。</p>
          <ul className="space-y-3">
            {STORIES.map((story) => (
              <li key={story.id}>
                <Link
                  to={`/game/${story.id}`}
                  className="block rounded-2xl border border-amber-500/40 bg-slate-800/80 p-4 shadow-lg transition hover:border-amber-400 hover:bg-slate-800"
                >
                  <span className="font-medium text-amber-300">{story.title}</span>
                  <span className="mt-1 block text-sm text-slate-300">
                    难度：{story.difficulty}
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">{story.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Home
