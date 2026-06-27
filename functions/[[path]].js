export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // ১. নিবন্ধন (Register) API
  if (url.pathname === "/api/register" && request.method === "POST") {
    try {
      const data = await request.json();
      await env.DB.prepare(
        "INSERT INTO Users (name, username, password, whatsapp_number, role) VALUES (?, ?, ?, ?, 'member')"
      )
      .bind(data.name || "", (data.username || "").toLowerCase().trim(), data.password || "", data.whatsapp_number || "")
      .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "ইউজারনেম ইতিমধ্যে আছে।" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // ২. লগইন (Login) API
  if (url.pathname === "/api/login" && request.method === "POST") {
    try {
      const data = await request.json();
      const user = await env.DB.prepare(
        "SELECT * FROM Users WHERE username = ? AND password = ?"
      )
      .bind((data.username || "").toLowerCase().trim(), data.password || "")
      .first();

      if (user) {
        return new Response(JSON.stringify({ success: true, role: user.role, name: user.name }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ success: false, message: "ভুল তথ্য!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "সার্ভার এরর" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // বাকি সব পেজ দেখানোর জন্য
  return env.ASSETS.fetch(request);
}
