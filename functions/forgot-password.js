export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const { username, newPassword } = await request.json();

    // এডমিন প্যানেলের পাসওয়ার্ড রিসেট টেবিলে ডাটা ইনসার্ট করা
    await env.DB.prepare("INSERT INTO reset_requests (username, new_password, status) VALUES (?, ?, 'pending')").bind(username, newPassword).run();

    return new Response(JSON.stringify({ success: true, message: "এডমিনের কাছে অনুরোধ পাঠানো হয়েছে!" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "ডাটাবেজ কানেকশন পাননি!" }), { status: 500 });
  }
}
