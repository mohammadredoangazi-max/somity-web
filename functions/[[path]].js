export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // ১. রেজিস্ট্রেশন API (/api/register)
  if (url.pathname === "/api/register" && request.method === "POST") {
    try {
      const data = await request.json();
      const { name, username, password, whatsapp_number } = data;

      // ডেটাবেজে মেম্বার যোগ করার SQL
      await env.DB.prepare(
        "INSERT INTO Users (name, username, password, whatsapp_number, role) VALUES (?, ?, ?, ?, 'member')"
      )
      .bind(name, username, password, whatsapp_number)
      .run();

      return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে!" }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে বা ভুল হয়েছে।" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // ২. লগইন API (/api/login)
  if (url.pathname === "/api/login" && request.method === "POST") {
    try {
      const data = await request.json();
      const { username, password } = data;

      // ডেটাবেজ থেকে ইউজার চেক করা
      const user = await env.DB.prepare(
        "SELECT * FROM Users WHERE username = ? AND password = ?"
      )
      .bind(username, password)
      .first();

      if (user) {
        return new Response(JSON.stringify({ success: true, role: user.role, name: user.name }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: "ইউজারনেম বা পাসওয়ার্ড ভুল!" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "সার্ভার সমস্যা!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // যদি API রিকোয়েস্ট না হয়, তবে আমাদের মেইন সাইটের পেজগুলো দেখাবে (Static Assets)
  return env.ASSETS.fetch(request);
}
