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

    // ব্যাকআপ টেস্ট ইউজার চেক (ডাটাবেজ কানেক্ট না থাকলেও যেন লগইন কাজ করে)
    if ((username === "redoan" || username === "01748723661") && password === "123") {
      return new Response(JSON.stringify({
        success: true,
        user: { name: "মোঃ রেদোয়ান গাজী", username: "redoan" }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ডাটাবেজ বাইন্ডিং চেক করা
    if (env && env.DB) {
      try {
        const userData = await env.DB.prepare("SELECT * FROM members WHERE username = ? OR phone = ?").bind(username, username).first();
        
        if (userData && userData.password === password) {
          return new Response(JSON.stringify({
            success: true,
            user: { name: userData.name, username: userData.username }
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
      } catch (dbError) {
        // ডাটাবেজে টেবিল না থাকলে বা এরর হলে এই ব্লকে আসবে, কিন্তু লগইন আটকে থাকবে না যদি টেস্ট ইউজার মিলে যায়
        console.error("Database Error:", dbError.message);
      }
    }

    return new Response(JSON.stringify({ success: false, error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // যেকোনো ক্র্যাশ এড়াতে সাধারণ সাকসেস রেসপন্স ব্যাকআপ
    return new Response(JSON.stringify({ success: false, error: "সার্ভার ইন্টারনাল এরর: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
