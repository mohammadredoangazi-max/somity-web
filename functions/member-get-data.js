export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId"); // লগইন করা মেম্বারের আইডি

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: "ইউজার আইডি পাওয়া যায়নি" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // ১. ডাটাবেজ থেকে এই নির্দিষ্ট মেম্বারের রিয়েল ডাটা নেওয়া
    const user = await env.DB.prepare(
      "SELECT name, username, totalDeposit, currentMonthStatus, loanStatus FROM users WHERE id = ?"
    ).bind(userId).first();

    // ২. সমিতির সর্বমোট ফান্ড হিসাব করা (যাতে মেম্বারও দেখতে পারে সমিতিতে মোট কত টাকা আছে)
    const fundResult = await env.DB.prepare("SELECT SUM(totalDeposit) as total FROM users").first();
    const totalFund = fundResult?.total || 0;

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "ইউজার পাওয়া যায়নি" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      userData: user,
      totalFund: totalFund
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
