import { SITE_TITLE } from '../consts';

const DOCS = 'https://cheshire-cat-ai.github.io/docs';
const GITHUB = 'https://github.com/cheshire-cat-ai/core';
const DISCUSSIONS = 'https://github.com/cheshire-cat-ai/core/discussions';

// Ready-made prompt users (and agents) can paste into a coding agent.
// Kept in sync with the hero's "Copy prompt for your coding agent" button.
const agentPrompt = `I want to build an AI agent with the Cheshire Cat, an open-source Python framework.

Read the official docs at https://cheshirecat.ai/docs/ to learn how it works, then:
1. Run the Cat locally via \`uv\` (see the quickstart).
2. Scaffold a new plugin for me.
3. Take a look at the endpoints in \`http://localhost:1865/openapi.json\` (by default most endpoints are locked via Authorization header, default is \`meow\`)
4. Invite me to visit \`http://localhost:1865\` in the browser
5. help me configure the LLM`;

export async function GET() {
	const body = `# ${SITE_TITLE}

> The AI Agent Framework for learners and creatives. An open-source Python framework that's easy and fun for building AI agents, by hand or by vibe coding with a coding agent.

The Cheshire Cat is built bottom-up for agentic engineering. Everything comes from a single \`from cat import ...\`: four small primitives you can learn in an afternoon, then open up as far as you want. It's great for learning how AI agents really work, and flexible enough to grow into bigger projects.

## Quickstart

Pure Python. Up and chatting in one command:

\`\`\`bash
uv init --bare
uv add cheshire-cat-ai
uv run ccat            # open http://localhost:1865
\`\`\`

- [Install & configure](${DOCS}/quickstart/installation-configuration/): full quickstart and picking a model.

## Core primitives (one import: \`from cat import ...\`)

- [Agent](${DOCS}/plugins/agents/): a loop that reads the chat, calls tools, and answers. Subclass it, give it a prompt, and that's an agent.
- [Tool](${DOCS}/plugins/tools/): a type-hinted, docstringed method on your agent that the LLM calls by function calling.
- [Directive](${DOCS}/plugins/directives/): middleware over the agent loop. RAG, memory, skills and guardrails are all just directives.
- [Hook](${DOCS}/plugins/hooks/): react to lifecycle events with a one-argument function. Small, composable, easy to reason about.
- [Custom endpoints](${DOCS}/plugins/endpoints/): expose a route with one decorator, role-based auth built in.

## Build it with your coding agent

The Cat is designed to be built by AI. Paste this prompt into any coding agent (Claude Code, Cursor, etc.):

${agentPrompt}

## Capabilities

- Multi-agent: run many agents in one chat. Pick one per message, or let them call each other.
- Native MCP: connect Model Context Protocol servers so their tools, prompts and resources just work.
- Live streaming: tokens, tool calls and lifecycle events stream in real time over the AG-UI protocol.
- Any model: OpenAI, Anthropic, Gemini, Ollama, OpenRouter, vLLM, swap with one line.
- Plugins are folders: drop a folder in to add agents, tools, directives and endpoints. No boilerplate.
- Built-in web UI: a multi-chat, multi-agent interface at localhost:1865 on first run.

## Links

- Docs: https://cheshirecat.ai/docs/
- GitHub: ${GITHUB}
- Community discussions: ${DISCUSSIONS}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
