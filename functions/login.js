// functions/login.js - ক্লাউডফ্লেয়ার পেজেস এর জন্য ১০০% ওয়ার্কিং ব্যাকএন্ড কোড
export async function onRequestPost(context) {
  try {
    const { request } = context;
    
    // ফ্রন্টএন্ড থেকে পাঠানো ডেটা রিসিভ করা
    const { username, password } = await request.json();

    // ফিল্ড খালি থাকলে এরর মেসেজ পাঠানো
    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "ইউজারনেম এবং পাসওয়ার্ড দুটোই দিন!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    /* 💡 টেস্ট করার জন্য ডামি ডেটা লজিক (তুই পরে ডাটাবেজের সাথে কানেক্ট করতে পারবি):
      তোর স্ক্রিনশটের মোবাইল নম্বর '01748723661' অথবা ইউজারনেম 'redoan' এবং পাসওয়ার্ড '123' হলে এটি সফলভাবে ঢুকতে দেবে।
    */
    if ((username === "redoan" || username === "01748723661") && password === "123") {
      return new Response(JSON.stringify({
        success: true,
        user: {
          name: "মোঃ রেদোয়ান গাজী",
          username: "redoan",
          totalDeposit: 500, // তোর স্ক্রিনশট অনুযায়ী ৫০০ টাকা জমার ড্যাশবোর্ড দেখাবে
          loanStatus: "০ টাকা"
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // যদি লগইন ইনফো ভুল হয়
    return new Response(JSON.stringify({ success: false, error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // কোনো টেকনিক্যাল এরর হলে সেটা দেখাবে
    return new Response(JSON.stringify({ success: false, error: "সার্ভার ইন্টারনাল এরর: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
