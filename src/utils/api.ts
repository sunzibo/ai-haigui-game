import type { TStory } from '../types'

type TAskAIResult = {
  answer: '是' | '否' | '无关'
  error?: string
}

const ALLOWED_ANSWER = new Set(['是', '否', '无关'])

function normalizeAnswer(raw: string): '是' | '否' | '无关' {
  const text = raw.trim()
  if (ALLOWED_ANSWER.has(text)) return text as '是' | '否' | '无关'
  if (text.includes('是')) return '是'
  if (text.includes('否')) return '否'
  return '无关'
}

export async function askAI(
  question: string,
  story: TStory,
): Promise<TAskAIResult> {
  const apiBase = import.meta.env.VITE_BACKEND_API_URL as string | undefined
  const endpoint = `${apiBase?.replace(/\/$/, '') || ''}/api/chat`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        story: {
          id: story.id,
          title: story.title,
          surface: story.surface,
          bottom: story.bottom,
        },
      }),
    })

    if (!response.ok) {
      return {
        answer: '无关',
        error: `AI 请求失败（${response.status}）`,
      }
    }

    const data = (await response.json()) as { answer?: string; error?: string }
    return {
      answer: normalizeAnswer(data.answer ?? ''),
      error: data.error,
    }
  } catch {
    return { answer: '无关', error: '网络异常，已使用默认回复“无关”' }
  }
}
