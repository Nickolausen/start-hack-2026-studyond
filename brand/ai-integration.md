# AI Integration

## Vercel AI SDK

```bash
npm install ai @ai-sdk/anthropic  # or @ai-sdk/openai
```

### Server Route

```tsx
// e.g. /api/chat
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages,
  });
  return result.toDataStreamResponse();
}
```

### Client Component

```tsx
import { useChat } from "ai/react";

function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}
```

## AI Visual Style

AI-related elements use the purple-blue gradient to distinguish them from standard UI. Add these utilities to your CSS (also included in [`colors.md`](colors.md)):

```css
.text-ai {
  @apply text-transparent bg-gradient-to-r from-purple-500 via-blue-700 to-blue-500 bg-clip-text;
}

.bg-ai {
  @apply bg-gradient-to-r from-purple-700 via-blue-600 via-60% to-purple-700 to-100% text-white;
}

.text-ai-solid {
  @apply text-blue-600;
}

.border-ai {
  @apply border-blue-200;
}
```

### Usage

```tsx
{/* AI badge */}
<span className="text-ai font-semibold">AI Suggestion</span>

{/* AI button */}
<Button className="bg-ai hover:opacity-90">Ask AI</Button>

{/* AI card border */}
<Card className="border-ai">...</Card>
```
