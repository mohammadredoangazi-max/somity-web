export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "ইউজারনেম এবং পাসওয়ার্ড দিন!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ক্লাউডফ্লেয়ার KV বা D1 ডাটাবেজ থেকে ইউজার চেক করা (তোর ডিরেক্টরি অনুযায়ী)
    // যদি ডাটাবেজে ইউজার না থাকে, তার জন্য তোর দেওয়া টেস্ট লগইন সচল রাখা হলো:
    if ((username === "redoan" || username === "01748723661") && password === "123") {
      return new Response(JSON.stringify({
        success: true,
        user: { name: "মোঃ রেদোয়ান গাজী", username: "redoan" }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ডাটাবেজ থেকে চেক করার লজিক
    const userData = await env.DB.prepare("SELECT * FROM members WHERE username = ? OR phone = ?").bind(username, username).first();
    
    if (userData && userData.password === password) {
      return new Response(JSON.stringify({
        success: true,
        user: { name: userData.name, username: userData.username }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
