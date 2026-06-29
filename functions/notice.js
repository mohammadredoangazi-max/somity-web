export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 📥 মেম্বার ও অ্যাডমিন যখন নোটিশ দেখতে চাইবে (GET Request)
  if (request.method === "GET") {
    try {
      const notice = await env.DB.prepare("SELECT content FROM notices WHERE id = 1").first();
      return new Response(JSON.stringify({ success: true, content: notice?.content || "" }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
  }

  // 📤 অ্যাডমিন যখন নোটিশ আপডেট করবে (POST Request)
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { content } = body;

      await env.DB.prepare(
        "INSERT INTO notices (id, content) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET content = ?, updated_at = CURRENT_TIMESTAMP"
      ).bind(content, content).run();

      return new Response(JSON.stringify({ success: true, message: "নোটিশ সফলভাবে আপডেট হয়েছে!" }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
  }
}
