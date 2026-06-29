// functions/login.js - ক্লাউডফ্লেয়ার পেজেস এর জন্য ফিক্সড কোড
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "ইউজারনেম এবং পাসওয়ার্ড দুটোই দিন" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ডামি ডাটাবেজ চেক লজিক (তোর আসল ডাটাবেজ বা D1 KV থাকলে সেই অনুযায়ী ম্যাচ করবে)
    // উদাহরণস্বরূপ ইউজারনেম 'redoan' অথবা মোবাইল নম্বর '01748723661' পাসওয়ার্ড '123' দিয়ে টেস্ট করতে পারিস
    if ((username === "redoan" || username === "01748723661") && password === "123") {
      return new Response(JSON.stringify({
        success: true,
        user: {
          name: "মোঃ রেদোয়ান গাজী",
          username: username,
          totalDeposit: 5000,
          loanStatus: "০ টাকা"
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // যদি ইউজার ডাটাবেজে না মিলে
    return new Response(JSON.stringify({ success: false, error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "সার্ভার ইন্টারনাল এরর: " + err.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
