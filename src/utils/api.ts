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
  const apiUrl = import.meta.env.VITE_AI_API_URL as string | undefined
  const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined
  const model = import.meta.env.VITE_AI_MODEL as string | undefined

  if (!apiUrl || !apiKey || !model) {
    return { answer: '无关', error: 'AI 配置缺失，请检查 .env.local' }
  }

  const systemPrompt =
    '你是海龟汤主持人。只能回答“是”“否”或“无关”三个词之一，不要输出任何解释、标点、换行、前后缀。不得泄露汤底内容。'
  const userPrompt = [
    `【汤面】${story.surface}`,
    `【汤底】${story.bottom}`,
    `【玩家问题】${question}`,
    '请严格只输出一个词：是 / 否 / 无关。',
  ].join('\n')

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
      }),
    })

    if (!response.ok) {
      return { answer: '无关', error: `AI 请求失败（${response.status}）` }
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content ?? ''
    return { answer: normalizeAnswer(content) }
  } catch {
    return { answer: '无关', error: '网络异常，已使用默认回复“无关”' }
  }
}
