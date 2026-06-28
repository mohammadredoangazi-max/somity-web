export default {
  async fetch(request, env, ctx) {
    // CORS হ্যান্ডেল করার জন্য হেডার
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // যদি প্রি-ফ্লাইট রিকোয়েস্ট আসে
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: "Database binding missing (DB not found)." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    try {
      // ১. ইউজার টেবিল থেকে ডাটা আনা
      const usersResult = await env.DB.prepare("SELECT username, whatsapp FROM users").all();
      const users = usersResult.results || [];

      // ২. মোট জমার হিসাব
      let totalFund = 0;
      try {
        const res = await env.DB.prepare("SELECT SUM(amount) as total FROM deposits").first();
        totalFund = res ? (res.total || 0) : 0;
      } catch(e) {}

      // ৩. মোট লোনের হিসাব
      let totalLoan = 0;
      try {
        const res = await env.DB.prepare("SELECT SUM(amount) as total FROM loans").first();
        totalLoan = res ? (res.total || 0) : 0;
      } catch(e) {}

      // ৪. মেম্বারদের লিস্ট রেডি করা
      const finalizedUsers = users.map(user => ({
        username: user.username,
        whatsapp: user.whatsapp || '--',
        totalDeposit: 0,
        currentMonthStatus: 'বাকি আছে',
        loanStatus: 'কোনো লোন নেই'
      }));

      return new Response(
        JSON.stringify({
          success: true,
          totalFund: totalFund,
          totalLoan: totalLoan,
          results: finalizedUsers
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  }
};
