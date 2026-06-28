export async function onRequest(context) {
  const { env } = context;
  
  try {
    // ১. ডাটাবেজ থেকে সব সদস্যদের রিয়েল ডাটা নিয়ে আসা
    const { results } = await env.DB.prepare(
      "SELECT id, username, whatsapp, totalDeposit, currentMonthStatus, loanStatus FROM users"
    ).all();

    // ২. লাইভ ডাটাবেজ থেকে মোট জমা ফান্ড হিসাব করা
    const fundResult = await env.DB.prepare("SELECT SUM(totalDeposit) as total FROM users").first();
    const totalFund = fundResult?.total || 0;

    // ৩. লাইভ ডাটাবেজ থেকে মোট কতজনের লোন আছে তা হিসাব করা (এখানে তুই তোর লোন টেবিল বা লজিক বসাতে পারিস)
    // আপাতত ইউজার টেবিল থেকেই লোন স্ট্যাটাস চেক করে একটি ডেমো সামারি করা হচ্ছে
    const totalLoan = 0; 

    return new Response(JSON.stringify({
      success: true,
      results: results || [],
      totalFund: totalFund,
      totalLoan: totalLoan
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
