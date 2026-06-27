export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // ১. রেজিস্ট্রেশন API
  if (url.pathname === "/api/register" && request.method === "POST") {
    try {
      const data = await request.json();
      const name = data.name || "";
      const username = data.username ? data.username.toLowerCase().trim() : "";
      const password = data.password || "";
      const whatsapp_number = data.whatsapp_number || "";

      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: "ইউজারনেম এবং পাসওয়ার্ড আবশ্যক।" }), {
          status: 400,
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      }

      await env.DB.prepare(
        "INSERT INTO Users (name, username, password, whatsapp_number, role) VALUES (?, ?, ?, ?, 'member')"
      )
      .bind(name, username, password, whatsapp_number)
      .run();

      return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে!" }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "ত্রুটি: ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়ে থাকতে পারে।" }), {
        status: 400,
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }
  }

  // ২. লগইন API
  if (url.pathname === "/api/login" && request.method === "POST") {
    try {
      const data = await request.json();
      const username = data.username ? data.username.toLowerCase().trim() : "";
      const password = data.password || "";

      const user = await env.DB.prepare(
        "SELECT * VALUES FROM Users WHERE username = ? AND password = ?"
      )
      .bind(username, password)
      .first();

      if (user) {
        return new Response(JSON.stringify({ success: true, role: user.role, name: user.name }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: "ইউজারনেম বা পাসওয়ার্ড ভুল!" }), {
          status: 401,
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "সার্ভারে সমস্যা হচ্ছে!" }), {
        status: 500,
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }
  }

  // ৩. বাকি সব রিকোয়েস্টের জন্য স্ট্যাটিক ফাইল লোড হবে
  return env.ASSETS.fetch(request);
}
