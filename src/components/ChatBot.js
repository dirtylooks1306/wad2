import OpenAI from 'openai';
const client = new OpenAI({
    organization: "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",
    project: "proj_XnKmlwc2kVpAdOzu8sRoLNpI	",
});
const response = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-4o-mini'
});

console.log(response._request_id);