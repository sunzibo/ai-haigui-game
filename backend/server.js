import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8787)

const ALLOWED_ANSWER = new Set(['是', '否', '无关'])

function normalizeAnswer(raw) {
  const text = String(raw || '').trim()
  if (ALLOWED_ANSWER.has(text)) return text
  if (text.includes('是')) return '是'
  if (text.includes('否')) return '否'
  return '无关'
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/chat', async (req, res) => {
  const { question, story } = req.body || {}

  if (!question || !story?.surface || !story?.bottom) {
    return res.status(400).json({ answer: '无关', error: '参数不完整' })
  }

  const deepseekApiUrl =
    process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions'
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY
  const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  if (!deepseekApiKey) {
    return res
      .status(500)
      .json({ answer: '无关', error: '后端缺少 DEEPSEEK_API_KEY' })
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
    const response = await fetch(deepseekApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: deepseekModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
      }),
    })

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ answer: '无关', error: `上游请求失败（${response.status}）` })
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    const answer = normalizeAnswer(content)
    return res.json({ answer })
  } catch {
    return res.status(500).json({ answer: '无关', error: '网络异常' })
  }
})

app.listen(port, () => {
  console.log(`AI Haigui backend running on http://localhost:${port}`)
})
