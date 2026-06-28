export async function onRequest(context) {
  const { request, env } = context;

  // শুধু POST রিকোয়েস্ট অ্যালাউ করা হবে
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount) {
      return new Response(JSON.stringify({ success: false, error: "ইউজার আইডি এবং টাকার পরিমাণ আবশ্যক!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const depositAmount = parseFloat(amount);

    // 💰 ক্লাউডফ্লেয়ার D1 ডাটাবেজে গিয়ে নির্দিষ্ট ইউজারের মোট জমা টাকা বাড়িয়ে দেওয়া এবং চলতি মাসের অবস্থা 'পরিশোধিত' করা
    await env.DB.prepare(
      "UPDATE users SET totalDeposit = totalDeposit + ?, currentMonthStatus = 'পরিশোধিত' WHERE id = ?"
    )
    .bind(depositAmount, userId)
    .run();

    return new Response(JSON.stringify({ success: true, message: "ডাটাবেজে সফলভাবে টাকা জমা হয়েছে!" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "ডাটাবেজ এরর: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
